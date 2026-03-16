import { Injectable, Logger, Scope } from '@nestjs/common';
import { getDatabaseOptimizationConfig, DatabaseOptimizationConfig } from '@/config/database-optimization';
import { DataSource, Repository, ObjectLiteral } from 'typeorm';

export type ConnectionType = 'master' | 'slave';

export interface ReadWriteStats {
  totalQueries: number;
  masterQueries: number;
  slaveQueries: number;
  masterRatio: number;
  slaveRatio: number;
}

export interface QueryContext {
  connectionType: ConnectionType;
  forced?: boolean;
  transaction?: boolean;
}

@Injectable({ scope: Scope.DEFAULT })
export class ReadWriteSplitService {
  private readonly logger = new Logger(ReadWriteSplitService.name);
  private readonly config: DatabaseOptimizationConfig;
  private readonly stats = {
    totalQueries: 0,
    masterQueries: 0,
    slaveQueries: 0,
  };
  private readonly connectionMap: Map<string, DataSource> = new Map();

  constructor() {
    this.config = getDatabaseOptimizationConfig(new (require('@nestjs/config').ConfigService)());
  }

  /**
   * 注册数据库连接
   * @param {string} name 连接名称
   * @param {DataSource} dataSource 数据源
   */
  registerConnection(name: string, dataSource: DataSource): void {
    this.connectionMap.set(name, dataSource);
    this.logger.log(`Registered connection: ${name}`);
  }

  getConnection(context?: QueryContext): DataSource {
    if (!this.config.readWriteSplit.enabled) {
      return this.getMasterConnection();
    }

    const connectionType = this.determineConnectionType(context);
    const connection = this.getConnectionByType(connectionType);

    this.stats.totalQueries++;
    if (connectionType === 'master') {
      this.stats.masterQueries++;
    } else {
      this.stats.slaveQueries++;
    }

    this.logger.debug(`Using ${connectionType} connection for query`);

    return connection;
  }

  /**
   * 获取主数据库连接
   * @returns {DataSource} 主数据源
   */
  getMasterConnection(): DataSource {
    const masterName = this.config.readWriteSplit.masterConnectionName;
    const connection = this.connectionMap.get(masterName);

    if (!connection) {
      throw new Error(`Master connection '${masterName}' not found`);
    }

    return connection;
  }

  getSlaveConnection(): DataSource {
    const slaveName = this.config.readWriteSplit.slaveConnectionName;
    const connection = this.connectionMap.get(slaveName);

    if (!connection) {
      this.logger.warn(`Slave connection '${slaveName}' not found, falling back to master`);
      return this.getMasterConnection();
    }

    return connection;
  }

  getRepository<T extends ObjectLiteral>(entity: any, context?: QueryContext): Repository<T> {
    const connection = this.getConnection(context);
    return connection.getRepository<T>(entity);
  }

  async withMasterConnection<T>(callback: (connection: DataSource) => Promise<T>): Promise<T> {
    const context: QueryContext = {
      connectionType: 'master',
      forced: true,
    };

    const connection = this.getConnection(context);
    return callback(connection);
  }

  async withSlaveConnection<T>(callback: (connection: DataSource) => Promise<T>): Promise<T> {
    const context: QueryContext = {
      connectionType: 'slave',
      forced: true,
    };

    const connection = this.getConnection(context);
    return callback(connection);
  }

  /**
   * 在事务中执行函数
   * @param {(connection: DataSource) => Promise<T>} callback 回调函数
   * @returns {Promise<T>} 执行结果
   */
  async withTransaction<T>(
    callback: (connection: DataSource) => Promise<T>
  ): Promise<T> {
    const context: QueryContext = {
      connectionType: 'master',
      forced: true,
      transaction: true,
    };

    const connection = this.getConnection(context);
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const result = await callback(connection);

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  getStats(): ReadWriteStats {
    const total = this.stats.totalQueries;
    const masterRatio = total > 0 ? (this.stats.masterQueries / total) * 100 : 0;
    const slaveRatio = total > 0 ? (this.stats.slaveQueries / total) * 100 : 0;

    return {
      totalQueries: total,
      masterQueries: this.stats.masterQueries,
      slaveQueries: this.stats.slaveQueries,
      masterRatio,
      slaveRatio,
    };
  }

  /**
   * 重置读写分离统计信息
   */
  resetStats(): void {
    this.stats.totalQueries = 0;
    this.stats.masterQueries = 0;
    this.stats.slaveQueries = 0;
    this.logger.log('Read-write split stats reset');
  }

  isReadWriteSplitEnabled(): boolean {
    return this.config.readWriteSplit.enabled;
  }

  /**
   * 获取读写比例
   * @returns {number} 读写比例
   */
  getReadWriteRatio(): number {
    return this.config.readWriteSplit.readWriteRatio;
  }

  private determineConnectionType(context?: QueryContext): ConnectionType {
    if (context?.forced) {
      return context.connectionType;
    }

    if (context?.transaction) {
      return 'master';
    }

    return this.shouldUseSlave() ? 'slave' : 'master';
  }

  private shouldUseSlave(): boolean {
    const ratio = this.config.readWriteSplit.readWriteRatio;
    return Math.random() < ratio;
  }

  private getConnectionByType(type: ConnectionType): DataSource {
    if (type === 'master') {
      return this.getMasterConnection();
    } else {
      return this.getSlaveConnection();
    }
  }
}
