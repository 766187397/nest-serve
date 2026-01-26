import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getConcurrencyControlConfig, ServiceDegradationConfig } from '@/config/concurrency-control';

export interface DegradationLevel {
  level: number;
  name: string;
  description: string;
}

export interface ServiceStatus {
  serviceName: string;
  isDegraded: boolean;
  degradationLevel: number;
  currentRequests: number;
  lastDegradedAt: number;
  lastRecoveredAt: number;
}

export interface FallbackHandler<T> {
  (error: Error): Promise<T>;
}

@Injectable()
export class ServiceDegradationService implements OnModuleInit {
  private readonly logger = new Logger(ServiceDegradationService.name);
  private readonly config: ServiceDegradationConfig;
  private readonly serviceStatus: Map<string, ServiceStatus> = new Map();
  private readonly fallbackHandlers: Map<string, FallbackHandler<unknown>> = new Map();
  private readonly degradationLevels: DegradationLevel[] = [
    { level: 0, name: 'NORMAL', description: '正常服务' },
    { level: 1, name: 'MINIMAL', description: '最小化服务' },
    { level: 2, name: 'EMERGENCY', description: '紧急模式' },
  ];
  private currentLevel = 0;

  constructor() {
    this.config = getConcurrencyControlConfig(new (require('@nestjs/config').ConfigService)()).serviceDegradation;
  }

  onModuleInit() {
    this.logger.log('Service degradation service initialized');
  }

  async execute<T>(
    serviceName: string,
    fn: () => Promise<T>,
    fallback?: FallbackHandler<T>
  ): Promise<T> {
    if (!this.config.enabled) {
      return fn();
    }

    const status = this.getOrCreateServiceStatus(serviceName);

    if (status.isDegraded && this.config.fallbackEnabled) {
      this.logger.warn(`Service ${serviceName} is degraded, using fallback`);
      const handler = this.fallbackHandlers.get(serviceName) || fallback;
      if (handler) {
        try {
          return await Promise.race([
            handler(new Error('Service degraded')),
            this.createFallbackTimeout(),
          ]) as T;
        } catch (error) {
          this.logger.error(`Fallback failed for service ${serviceName}:`, error);
          throw error;
        }
      }
    }

    status.currentRequests++;

    try {
      const result = await fn();
      status.currentRequests--;
      this.checkServiceRecovery(serviceName, status);
      return result;
    } catch (error) {
      status.currentRequests--;
      this.checkServiceDegradation(serviceName, status);
      throw error;
    }
  }

  registerFallback<T>(serviceName: string, handler: FallbackHandler<T>): void {
    this.fallbackHandlers.set(serviceName, handler);
    this.logger.log(`Fallback handler registered for service: ${serviceName}`);
  }

  degrade(serviceName: string, level: number = 1): void {
    const status = this.getOrCreateServiceStatus(serviceName);
    status.isDegraded = true;
    status.degradationLevel = level;
    status.lastDegradedAt = Date.now();
    this.logger.warn(`Service ${serviceName} degraded to level ${level}`);
  }

  recover(serviceName: string): void {
    const status = this.serviceStatus.get(serviceName);
    if (status) {
      status.isDegraded = false;
      status.degradationLevel = 0;
      status.lastRecoveredAt = Date.now();
      this.logger.log(`Service ${serviceName} recovered`);
    }
  }

  setGlobalDegradationLevel(level: number): void {
    if (level < 0 || level >= this.degradationLevels.length) {
      throw new Error(`Invalid degradation level: ${level}`);
    }
    this.currentLevel = level;
    this.logger.warn(`Global degradation level set to ${this.degradationLevels[level].name}`);

    for (const [serviceName, status] of this.serviceStatus) {
      if (level > 0 && !status.isDegraded) {
        this.degrade(serviceName, level);
      } else if (level === 0 && status.isDegraded) {
        this.recover(serviceName);
      }
    }
  }

  getServiceStatus(serviceName: string): ServiceStatus | undefined {
    return this.serviceStatus.get(serviceName);
  }

  getAllServiceStatus(): Map<string, ServiceStatus> {
    return new Map(this.serviceStatus);
  }

  getDegradationLevels(): DegradationLevel[] {
    return this.degradationLevels;
  }

  getCurrentLevel(): DegradationLevel {
    return this.degradationLevels[this.currentLevel];
  }

  private getOrCreateServiceStatus(serviceName: string): ServiceStatus {
    if (!this.serviceStatus.has(serviceName)) {
      this.serviceStatus.set(serviceName, {
        serviceName,
        isDegraded: false,
        degradationLevel: 0,
        currentRequests: 0,
        lastDegradedAt: 0,
        lastRecoveredAt: 0,
      });
    }
    return this.serviceStatus.get(serviceName)!;
  }

  private checkServiceDegradation(serviceName: string, status: ServiceStatus): void {
    if (status.currentRequests > this.config.maxConcurrentRequests) {
      this.degrade(serviceName, 1);
    }
  }

  private checkServiceRecovery(serviceName: string, status: ServiceStatus): void {
    if (status.isDegraded && status.currentRequests < this.config.maxConcurrentRequests * 0.5) {
      const timeSinceDegraded = Date.now() - status.lastDegradedAt;
      if (timeSinceDegraded > 60000) {
        this.recover(serviceName);
      }
    }
  }

  private createFallbackTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Fallback timeout'));
      }, this.config.fallbackTimeout);
    });
  }
}
