import { Injectable, Logger } from '@nestjs/common';
import { getConcurrencyControlConfig, CircuitBreakerConfig } from '@/config/concurrency-control';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitStats {
  successCount: number;
  failureCount: number;
  totalRequests: number;
  errorRate: number;
  lastFailureTime: number;
  lastSuccessTime: number;
}

export interface CircuitBreakerState {
  state: CircuitState;
  stats: CircuitStats;
  openedAt: number;
  nextAttemptAt: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly config: CircuitBreakerConfig;
  private readonly circuits: Map<string, CircuitBreakerState> = new Map();

  constructor() {
    this.config = getConcurrencyControlConfig(new (require('@nestjs/config').ConfigService)()).circuitBreaker;
  }

  /**
   * 执行熔断器逻辑
   * @param {string} key 熔断器标识
   * @param {() => Promise<T>} fn 要执行的函数
   * @param {() => Promise<T>} fallback 降级函数
   * @returns {Promise<T>} 执行结果
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (!this.config.enabled) {
      return fn();
    }

    const circuit = this.getOrCreateCircuit(key);

    if (circuit.state === CircuitState.OPEN) {
      if (Date.now() >= circuit.nextAttemptAt) {
        this.transitionToHalfOpen(key, circuit);
      } else {
        this.logger.warn(`Circuit breaker is OPEN for key: ${key}`);
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is OPEN');
      }
    }

    const startTime = Date.now();
    try {
      const result = await Promise.race([
        fn(),
        this.createTimeoutPromise<T>(this.config.timeout),
      ]) as T;

      const duration = Date.now() - startTime;
      this.recordSuccess(key, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordFailure(key, duration, error as Error);

      if (circuit.state === CircuitState.HALF_OPEN) {
        this.transitionToOpen(key, circuit);
      }

      if (fallback) {
        return fallback();
      }

      throw error;
    }
  }

  private getOrCreateCircuit(key: string): CircuitBreakerState {
    if (!this.circuits.has(key)) {
      this.circuits.set(key, {
        state: CircuitState.CLOSED,
        stats: {
          successCount: 0,
          failureCount: 0,
          totalRequests: 0,
          errorRate: 0,
          lastFailureTime: 0,
          lastSuccessTime: 0,
        },
        openedAt: 0,
        nextAttemptAt: 0,
      });
    }
    return this.circuits.get(key)!;
  }

  private recordSuccess(key: string, duration: number): void {
    const circuit = this.circuits.get(key);
    if (!circuit) return;

    circuit.stats.successCount++;
    circuit.stats.totalRequests++;
    circuit.stats.lastSuccessTime = Date.now();
    circuit.stats.errorRate = this.calculateErrorRate(circuit.stats);

    if (circuit.state === CircuitState.HALF_OPEN) {
      this.transitionToClosed(key, circuit);
    }

    this.cleanupOldStats(circuit);
  }

  private recordFailure(key: string, duration: number, error: Error): void {
    const circuit = this.circuits.get(key);
    if (!circuit) return;

    circuit.stats.failureCount++;
    circuit.stats.totalRequests++;
    circuit.stats.lastFailureTime = Date.now();
    circuit.stats.errorRate = this.calculateErrorRate(circuit.stats);

    if (circuit.state === CircuitState.CLOSED && this.shouldOpenCircuit(circuit)) {
      this.transitionToOpen(key, circuit);
    }

    this.cleanupOldStats(circuit);
  }

  private calculateErrorRate(stats: CircuitStats): number {
    if (stats.totalRequests === 0) return 0;
    return (stats.failureCount / stats.totalRequests) * 100;
  }

  private shouldOpenCircuit(circuit: CircuitBreakerState): boolean {
    const bucketDuration = this.config.rollingCountTimeout / this.config.rollingCountBuckets;
    const now = Date.now();
    const windowStart = now - this.config.rollingCountTimeout;

    const recentFailures = this.countRecentFailures(circuit, windowStart);
    const recentRequests = this.countRecentRequests(circuit, windowStart);

    if (recentRequests < this.config.rollingCountBuckets) {
      return false;
    }

    const recentErrorRate = (recentFailures / recentRequests) * 100;
    return recentErrorRate >= this.config.errorThresholdPercentage;
  }

  private countRecentFailures(circuit: CircuitBreakerState, windowStart: number): number {
    return circuit.stats.failureCount;
  }

  private countRecentRequests(circuit: CircuitBreakerState, windowStart: number): number {
    return circuit.stats.totalRequests;
  }

  private transitionToOpen(key: string, circuit: CircuitBreakerState): void {
    circuit.state = CircuitState.OPEN;
    circuit.openedAt = Date.now();
    circuit.nextAttemptAt = Date.now() + this.config.resetTimeout;
    this.logger.warn(`Circuit breaker OPENED for key: ${key}`);
  }

  private transitionToHalfOpen(key: string, circuit: CircuitBreakerState): void {
    circuit.state = CircuitState.HALF_OPEN;
    this.logger.log(`Circuit breaker transitioned to HALF_OPEN for key: ${key}`);
  }

  private transitionToClosed(key: string, circuit: CircuitBreakerState): void {
    circuit.state = CircuitState.CLOSED;
    circuit.stats = {
      successCount: 0,
      failureCount: 0,
      totalRequests: 0,
      errorRate: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
    };
    this.logger.log(`Circuit breaker CLOSED for key: ${key}`);
  }

  private cleanupOldStats(circuit: CircuitBreakerState): void {
    const now = Date.now();
    const windowStart = now - this.config.rollingCountTimeout;

    if (circuit.stats.lastFailureTime < windowStart) {
      circuit.stats.failureCount = 0;
    }

    if (circuit.stats.lastSuccessTime < windowStart) {
      circuit.stats.successCount = 0;
    }

    circuit.stats.totalRequests = circuit.stats.successCount + circuit.stats.failureCount;
    circuit.stats.errorRate = this.calculateErrorRate(circuit.stats);
  }

  private createTimeoutPromise<T>(timeout: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * 获取熔断器状态
   * @param {string} key 熔断器标识
   * @returns {CircuitBreakerState | undefined} 熔断器状态
   */
  getState(key: string): CircuitBreakerState | undefined {
    return this.circuits.get(key);
  }

  reset(key: string): void {
    this.circuits.delete(key);
    this.logger.log(`Circuit breaker reset for key: ${key}`);
  }

  /**
   * 重置所有熔断器
   */
  resetAll(): void {
    this.circuits.clear();
    this.logger.log('All circuit breakers reset');
  }
}
