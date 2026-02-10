import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PoolStats, MysqlPool, PostgresPool, MysqlDriver, PostgresDriver } from '@/types/pool';

@Injectable()
export class ConnectionPoolMonitorService {
  private readonly logger = new Logger(ConnectionPoolMonitorService.name);
  private readonly statsHistory: Map<string, Array<{ timestamp: number; stats: PoolStats }>> =
    new Map();
  private readonly MAX_HISTORY_SIZE = 100;

  constructor(
    @InjectDataSource() private readonly mainDataSource: DataSource,
    @InjectDataSource('logger') private readonly loggerDataSource: DataSource
  ) {}

  /**
   * 获取主数据库连接池统计信息
   * @returns {Promise<PoolStats>} 连接池统计信息
   */
  async getMainPoolStats(): Promise<PoolStats> {
    return this.getPoolStats(this.mainDataSource, 'main');
  }

  /**
   * 获取日志数据库连接池统计信息
   * @returns {Promise<PoolStats>} 连接池统计信息
   */
  async getLoggerPoolStats(): Promise<PoolStats> {
    return this.getPoolStats(this.loggerDataSource, 'logger');
  }

  async getAllPoolStats(): Promise<{ main: PoolStats; logger: PoolStats }> {
    const [main, logger] = await Promise.all([this.getMainPoolStats(), this.getLoggerPoolStats()]);
    return { main, logger };
  }

  private async getPoolStats(dataSource: DataSource, poolName: string): Promise<PoolStats> {
    try {
      const driver = dataSource.driver as unknown;
      let pool: MysqlPool | PostgresPool | null = null;

      if (this.isMysqlDriver(driver)) {
        pool = driver.master;
      } else if (this.isPostgresDriver(driver)) {
        pool = driver.pool;
      }

      if (!pool) {
        this.logger.warn(`Connection pool not found for ${poolName}`);
        return this.getDefaultStats();
      }

      let stats: PoolStats;

      if (this.isMysqlPool(pool)) {
        stats = this.getMysqlPoolStats(pool);
      } else if (this.isPostgresPool(pool)) {
        stats = this.getPostgresPoolStats(pool);
      } else {
        stats = this.getDefaultStats();
      }

      this.recordStats(poolName, stats);
      return stats;
    } catch (error) {
      this.logger.error(`Error getting pool stats for ${poolName}:`, error);
      return this.getDefaultStats();
    }
  }

  private isMysqlDriver(driver: unknown): driver is MysqlDriver {
    const mysqlDriver = driver as MysqlDriver;
    return typeof mysqlDriver === 'object' && mysqlDriver !== null && 'master' in mysqlDriver;
  }

  private isPostgresDriver(driver: unknown): driver is PostgresDriver {
    const postgresDriver = driver as PostgresDriver;
    return (
      typeof postgresDriver === 'object' && postgresDriver !== null && 'pool' in postgresDriver
    );
  }

  private isMysqlPool(pool: unknown): pool is MysqlPool {
    const mysqlPool = pool as MysqlPool;
    return (
      typeof mysqlPool === 'object' &&
      mysqlPool !== null &&
      '_allConnections' in mysqlPool &&
      Array.isArray(mysqlPool._allConnections)
    );
  }

  private isPostgresPool(pool: unknown): pool is PostgresPool {
    const postgresPool = pool as PostgresPool;
    return (
      typeof postgresPool === 'object' &&
      postgresPool !== null &&
      'totalCount' in postgresPool &&
      typeof postgresPool.totalCount === 'number'
    );
  }

  private getMysqlPoolStats(pool: MysqlPool): PoolStats {
    return {
      totalConnections: pool._allConnections.length,
      idleConnections: pool._freeConnections.length,
      activeConnections: pool._allConnections.length - pool._freeConnections.length,
      waitingRequests: pool._connectionQueue.length,
      maxConnections: pool._connectionLimit,
      minConnections: 0,
    };
  }

  private getPostgresPoolStats(pool: PostgresPool): PoolStats {
    return {
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      activeConnections: pool.totalCount - pool.idleCount,
      waitingRequests: pool.waitingCount,
      maxConnections: pool.options.max,
      minConnections: pool.options.min,
    };
  }

  private getDefaultStats(): PoolStats {
    return {
      totalConnections: 0,
      idleConnections: 0,
      activeConnections: 0,
      waitingRequests: 0,
      maxConnections: 10,
      minConnections: 2,
    };
  }

  private recordStats(poolName: string, stats: PoolStats): void {
    if (!this.statsHistory.has(poolName)) {
      this.statsHistory.set(poolName, []);
    }

    const history = this.statsHistory.get(poolName);
    if (history) {
      history.push({ timestamp: Date.now(), stats });

      if (history.length > this.MAX_HISTORY_SIZE) {
        history.shift();
      }
    }
  }

  getStatsHistory(
    poolName: string,
    limit: number = 10
  ): Array<{ timestamp: number; stats: PoolStats }> {
    const history = this.statsHistory.get(poolName) || [];
    return history.slice(-limit);
  }

  async getPoolHealthStatus(): Promise<{
    main: { healthy: boolean; issues: string[] };
    logger: { healthy: boolean; issues: string[] };
  }> {
    const [mainStats, loggerStats] = await Promise.all([
      this.getMainPoolStats(),
      this.getLoggerPoolStats(),
    ]);

    return {
      main: this.checkHealth(mainStats, 'main'),
      logger: this.checkHealth(loggerStats, 'logger'),
    };
  }

  private checkHealth(stats: PoolStats, poolName: string): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];

    if (stats.activeConnections / stats.maxConnections > 0.9) {
      issues.push(
        `${poolName}: 连接池使用率超过90% (${stats.activeConnections}/${stats.maxConnections})`
      );
    }

    if (stats.waitingRequests > 10) {
      issues.push(`${poolName}: 等待连接的请求数过多 (${stats.waitingRequests})`);
    }

    if (stats.idleConnections > stats.maxConnections * 0.5) {
      issues.push(`${poolName}: 空闲连接过多 (${stats.idleConnections}/${stats.maxConnections})`);
    }

    return {
      healthy: issues.length === 0,
      issues,
    };
  }

  /**
   * 记录连接池统计信息到日志
   */
  async logPoolStats(): Promise<void> {
    const [main, logger] = await Promise.all([this.getMainPoolStats(), this.getLoggerPoolStats()]);

    this.logger.log('Main DB Pool Stats:', {
      total: main.totalConnections,
      active: main.activeConnections,
      idle: main.idleConnections,
      waiting: main.waitingRequests,
      max: main.maxConnections,
    });

    this.logger.log('Logger DB Pool Stats:', {
      total: logger.totalConnections,
      active: logger.activeConnections,
      idle: logger.idleConnections,
      waiting: logger.waitingRequests,
      max: logger.maxConnections,
    });
  }
}
