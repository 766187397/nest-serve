import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getDatabaseOptimizationConfig, DatabaseOptimizationConfig } from '@/config/database-optimization';

export interface SlowQuery {
  id: string;
  query: string;
  duration: number;
  timestamp: number;
  parameters?: any[];
  connectionName?: string;
  entityType?: string;
  operation?: 'select' | 'insert' | 'update' | 'delete' | 'create' | 'drop' | 'alter';
}

@Injectable()
export class SlowQueryMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SlowQueryMonitorService.name);
  private readonly config: DatabaseOptimizationConfig;
  private readonly slowQueries: SlowQuery[] = [];
  private readonly queryDurations: Map<string, number[]> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = getDatabaseOptimizationConfig(new (require('@nestjs/config').ConfigService)());
  }

  onModuleInit() {
    if (this.config.slowQuery.enabled) {
      this.logger.log(`Slow query monitoring enabled (threshold: ${this.config.slowQuery.threshold}ms)`);
    }
  }

  onModuleDestroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  /**
   * 记录慢查询
   * @param {string} query 查询语句
   * @param {number} duration 执行时长（毫秒）
   * @param {any[]} parameters 查询参数
   * @param {string} connectionName 连接名称
   * @param {string} entityType 实体类型
   */
  recordSlowQuery(
    query: string,
    duration: number,
    parameters?: any[],
    connectionName?: string,
    entityType?: string
  ): void {
    if (!this.config.slowQuery.enabled) {
      return;
    }

    const operation = this.detectOperation(query);

    const slowQuery: SlowQuery = {
      id: this.generateId(),
      query: this.sanitizeQuery(query),
      duration,
      timestamp: Date.now(),
      parameters,
      connectionName,
      entityType,
      operation,
    };

    this.slowQueries.push(slowQuery);

    if (this.slowQueries.length > this.config.slowQuery.maxHistorySize) {
      this.slowQueries.shift();
    }

    this.logSlowQuery(slowQuery);

    this.updateQueryStatistics(query, duration);
  }

  /**
   * 获取慢查询列表
   * @param {number} limit 返回数量限制
   * @returns {SlowQuery[]} 慢查询列表
   */
  getSlowQueries(limit?: number): SlowQuery[] {
    const queries = [...this.slowQueries].sort((a, b) => b.timestamp - a.timestamp);
    return limit ? queries.slice(0, limit) : queries;
  }

  getSlowQueriesByEntityType(entityType: string, limit?: number): SlowQuery[] {
    const queries = this.slowQueries
      .filter((q) => q.entityType === entityType)
      .sort((a, b) => b.timestamp - a.timestamp);
    return limit ? queries.slice(0, limit) : queries;
  }

  getSlowQueriesByOperation(operation: string, limit?: number): SlowQuery[] {
    const queries = this.slowQueries
      .filter((q) => q.operation === operation)
      .sort((a, b) => b.timestamp - a.timestamp);
    return limit ? queries.slice(0, limit) : queries;
  }

  getSlowQueryStatistics(): {
    totalSlowQueries: number;
    averageDuration: number;
    maxDuration: number;
    minDuration: number;
    byOperation: Record<string, number>;
    byEntityType: Record<string, number>;
  } {
    if (this.slowQueries.length === 0) {
      return {
        totalSlowQueries: 0,
        averageDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        byOperation: {},
        byEntityType: {},
      };
    }

    const durations = this.slowQueries.map((q) => q.duration);
    const byOperation: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};

    for (const query of this.slowQueries) {
      if (query.operation) {
        byOperation[query.operation] = (byOperation[query.operation] || 0) + 1;
      }
      if (query.entityType) {
        byEntityType[query.entityType] = (byEntityType[query.entityType] || 0) + 1;
      }
    }

    return {
      totalSlowQueries: this.slowQueries.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      byOperation,
      byEntityType,
    };
  }

  /**
   * 获取指定查询的统计信息
   * @param {string} query 查询语句
   * @returns {Object} 统计信息
   */
  getQueryStatistics(query: string): {
    count: number;
    averageDuration: number;
    maxDuration: number;
    minDuration: number;
  } {
    const durations = this.queryDurations.get(query) || [];
    if (durations.length === 0) {
      return { count: 0, averageDuration: 0, maxDuration: 0, minDuration: 0 };
    }

    return {
      count: durations.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
    };
  }

  /**
   * 清除慢查询历史
   */
  clearSlowQueries(): void {
    this.slowQueries.length = 0;
    this.queryDurations.clear();
    this.logger.log('Slow query history cleared');
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldQueries(): Promise<void> {
    const oneHourAgo = Date.now() - 3600000;
    const initialSize = this.slowQueries.length;

    for (let i = this.slowQueries.length - 1; i >= 0; i--) {
      if (this.slowQueries[i].timestamp < oneHourAgo) {
        this.slowQueries.splice(i, 1);
      }
    }

    const cleanedUp = initialSize - this.slowQueries.length;
    if (cleanedUp > 0) {
      this.logger.log(`Cleaned up ${cleanedUp} old slow queries`);
    }
  }

  private detectOperation(query: string): SlowQuery['operation'] {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.startsWith('select')) return 'select';
    if (normalizedQuery.startsWith('insert')) return 'insert';
    if (normalizedQuery.startsWith('update')) return 'update';
    if (normalizedQuery.startsWith('delete')) return 'delete';
    if (normalizedQuery.startsWith('create')) return 'create';
    if (normalizedQuery.startsWith('drop')) return 'drop';
    if (normalizedQuery.startsWith('alter')) return 'alter';
    return 'select';
  }

  private sanitizeQuery(query: string): string {
    return query.replace(/\s+/g, ' ').trim();
  }

  private logSlowQuery(slowQuery: SlowQuery): void {
    const logMessage = `Slow query detected (${slowQuery.duration}ms > ${this.config.slowQuery.threshold}ms): ${slowQuery.query}`;

    switch (this.config.slowQuery.logLevel) {
      case 'error':
        this.logger.error(logMessage);
        break;
      case 'warn':
        this.logger.warn(logMessage);
        break;
      case 'info':
        this.logger.log(logMessage);
        break;
    }
  }

  private updateQueryStatistics(query: string, duration: number): void {
    const sanitizedQuery = this.sanitizeQuery(query);
    if (!this.queryDurations.has(sanitizedQuery)) {
      this.queryDurations.set(sanitizedQuery, []);
    }

    const durations = this.queryDurations.get(sanitizedQuery)!;
    durations.push(duration);

    if (durations.length > 100) {
      durations.shift();
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
