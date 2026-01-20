import { join } from 'path';

const env = process.env;

const os = require('os');
const cpuCores = os.cpus().length;

/** 数据库配置类型 */
export interface MysqlConfig {
  /** 数据库类型 */
  DB_TYPE: string;
  /** 数据地址 */
  DB_HOST: string;
  /** 数据库端口 */
  DB_PORT: number;
  /** 数据库用户名 */
  DB_USER: string;
  /** 数据库密码 */
  DB_PASSWORD: string;
  /** 数据库名称 */
  DB_DATABASE: string;
  /** 连接池配置 */
  DB_POOL_SIZE?: number;
  /** 最小连接数 */
  DB_POOL_MIN?: number;
  /** 连接超时(毫秒) */
  DB_CONNECTION_TIMEOUT?: number;
  /** 空闲超时(毫秒) */
  DB_IDLE_TIMEOUT?: number;
  /** 连接最大生命周期(毫秒) */
  DB_MAX_LIFETIME?: number;
  /** 从库地址(读写分离) */
  DB_SLAVE_HOST?: string;
  /** 从库端口 */
  DB_SLAVE_PORT?: number;
}

/** PostgreSQL配置类型 */
export interface PgConfig {
  /** 数据库类型 */
  DB_TYPE: string;
  /** 数据地址 */
  DB_HOST: string;
  /** 数据库端口 */
  DB_PORT: number;
  /** 数据库用户名 */
  DB_USER: string;
  /** 数据库密码 */
  DB_PASSWORD: string;
  /** 数据库名称 */
  DB_DATABASE: string;
  /** 连接池配置 */
  DB_POOL_SIZE?: number;
  /** 最小连接数 */
  DB_POOL_MIN?: number;
  /** 连接超时(毫秒) */
  DB_CONNECTION_TIMEOUT?: number;
  /** 空闲超时(毫秒) */
  DB_IDLE_TIMEOUT?: number;
  /** 连接最大生命周期(毫秒) */
  DB_MAX_LIFETIME?: number;
  /** 从库地址(读写分离) */
  DB_SLAVE_HOST?: string;
  /** 从库端口 */
  DB_SLAVE_PORT?: number;
}

/** mysql 配置 */
const mysqlConfig: MysqlConfig = {
  /** 数据库类型 */
  DB_TYPE: 'mysql',
  /** 数据地址 */
  DB_HOST: env.DB_HOST || '127.0.0.1',
  /** 数据库端口 */
  DB_PORT: Number(env.DB_PORT) || 3306,
  /** 数据库用户名 */
  DB_USER: env.DB_USER || 'root',
  /** 数据库密码 */
  DB_PASSWORD: env.DB_PASSWORD || '123456',
  /** 数据库名称 */
  DB_DATABASE: env.DB_DATABASE || 'nest-serve',
  /** 连接池大小: 建议值为 (CPU核心数 * 2) + 有效磁盘数 */
  DB_POOL_SIZE: Number(env.DB_POOL_SIZE) || cpuCores * 2 + 1,
  /** 最小连接数: 保持连接池中至少有这些数量的连接 */
  DB_POOL_MIN: Number(env.DB_POOL_MIN) || Math.max(2, Math.floor((cpuCores * 2 + 1) / 4)),
  /** 连接超时: 等待获取连接的最大时间(毫秒) */
  DB_CONNECTION_TIMEOUT: Number(env.DB_CONNECTION_TIMEOUT) || 30000,
  /** 空闲超时: 连接在池中空闲超过此时间将被释放(毫秒) */
  DB_IDLE_TIMEOUT: Number(env.DB_IDLE_TIMEOUT) || 300000,
  /** 连接最大生命周期: 连接在池中的最大存活时间(毫秒) */
  DB_MAX_LIFETIME: Number(env.DB_MAX_LIFETIME) || 1800000,
  /** 从库地址 */
  DB_SLAVE_HOST: env.DB_SLAVE_HOST || env.DB_HOST || '127.0.0.1',
  /** 从库端口 */
  DB_SLAVE_PORT: Number(env.DB_SLAVE_PORT) || Number(env.DB_PORT) || 3306,
};

/** mysql 日志 */
const mysqlLogger: MysqlConfig = {
  /** 数据库类型 */
  DB_TYPE: 'mysql',
  /** 数据地址 */
  DB_HOST: env.LOG_DB_HOST || '127.0.0.1',
  /** 数据库端口 */
  DB_PORT: Number(env.LOG_DB_PORT) || 3306,
  /** 数据库用户名 */
  DB_USER: env.LOG_DB_USER || 'root',
  /** 数据库密码 */
  DB_PASSWORD: env.LOG_DB_PASSWORD || '123456',
  /** 数据库名称 */
  DB_DATABASE: env.LOG_DB_DATABASE || 'nest-serve-logger',
  /** 连接池大小 */
  DB_POOL_SIZE: Number(env.LOG_DB_POOL_SIZE) || Math.max(2, Math.floor((cpuCores * 2 + 1) / 2)),
  /** 最小连接数 */
  DB_POOL_MIN:
    Number(env.LOG_DB_POOL_MIN) ||
    Math.max(1, Math.floor(Math.max(2, Math.floor((cpuCores * 2 + 1) / 2)) / 4)),
  /** 连接超时 */
  DB_CONNECTION_TIMEOUT: Number(env.LOG_DB_CONNECTION_TIMEOUT) || 30000,
  /** 空闲超时 */
  DB_IDLE_TIMEOUT: Number(env.LOG_DB_IDLE_TIMEOUT) || 300000,
  /** 连接最大生命周期 */
  DB_MAX_LIFETIME: Number(env.LOG_DB_MAX_LIFETIME) || 1800000,
  /** 从库地址 */
  DB_SLAVE_HOST: env.LOG_DB_SLAVE_HOST || env.LOG_DB_HOST || '127.0.0.1',
  /** 从库端口 */
  DB_SLAVE_PORT: Number(env.LOG_DB_SLAVE_PORT) || Number(env.LOG_DB_PORT) || 3306,
};

/** PostgreSQL 配置 */
const pgConfig: PgConfig = {
  /** 数据库类型 */
  DB_TYPE: 'postgres',
  /** 数据地址 */
  DB_HOST: env.DB_HOST || '127.0.0.1',
  /** 数据库端口 */
  DB_PORT: Number(env.DB_PORT) || 5432,
  /** 数据库用户名 */
  DB_USER: env.DB_USER || 'postgres',
  /** 数据库密码 */
  DB_PASSWORD: env.DB_PASSWORD || '123456',
  /** 数据库名称 */
  DB_DATABASE: env.DB_DATABASE || 'nest-serve',
  /** 连接池大小: 建议值为 (CPU核心数 * 2) + 有效磁盘数 */
  DB_POOL_SIZE: Number(env.DB_POOL_SIZE) || cpuCores * 2 + 1,
  /** 最小连接数: 保持连接池中至少有这些数量的连接 */
  DB_POOL_MIN: Number(env.DB_POOL_MIN) || Math.max(2, Math.floor((cpuCores * 2 + 1) / 4)),
  /** 连接超时: 等待获取连接的最大时间(毫秒) */
  DB_CONNECTION_TIMEOUT: Number(env.DB_CONNECTION_TIMEOUT) || 30000,
  /** 空闲超时: 连接在池中空闲超过此时间将被释放(毫秒) */
  DB_IDLE_TIMEOUT: Number(env.DB_IDLE_TIMEOUT) || 300000,
  /** 连接最大生命周期: 连接在池中的最大存活时间(毫秒) */
  DB_MAX_LIFETIME: Number(env.DB_MAX_LIFETIME) || 1800000,
  /** 从库地址 */
  DB_SLAVE_HOST: env.DB_SLAVE_HOST || env.DB_HOST || '127.0.0.1',
  /** 从库端口 */
  DB_SLAVE_PORT: Number(env.DB_SLAVE_PORT) || Number(env.DB_PORT) || 5432,
};

/** PostgreSQL 日志 */
const pgLogger: PgConfig = {
  /** 数据库类型 */
  DB_TYPE: 'postgres',
  /** 数据地址 */
  DB_HOST: env.LOG_DB_HOST || '127.0.0.1',
  /** 数据库端口 */
  DB_PORT: Number(env.LOG_DB_PORT) || 5432,
  /** 数据库用户名 */
  DB_USER: env.LOG_DB_USER || 'postgres',
  /** 数据库密码 */
  DB_PASSWORD: env.LOG_DB_PASSWORD || '123456',
  /** 数据库名称 */
  DB_DATABASE: env.LOG_DB_DATABASE || 'nest-serve-logger',
  /** 连接池大小 */
  DB_POOL_SIZE: Number(env.LOG_DB_POOL_SIZE) || Math.max(2, Math.floor((cpuCores * 2 + 1) / 2)),
  /** 最小连接数 */
  DB_POOL_MIN:
    Number(env.LOG_DB_POOL_MIN) ||
    Math.max(1, Math.floor(Math.max(2, Math.floor((cpuCores * 2 + 1) / 2)) / 4)),
  /** 连接超时 */
  DB_CONNECTION_TIMEOUT: Number(env.LOG_DB_CONNECTION_TIMEOUT) || 30000,
  /** 空闲超时 */
  DB_IDLE_TIMEOUT: Number(env.LOG_DB_IDLE_TIMEOUT) || 300000,
  /** 连接最大生命周期 */
  DB_MAX_LIFETIME: Number(env.LOG_DB_MAX_LIFETIME) || 1800000,
  /** 从库地址 */
  DB_SLAVE_HOST: env.LOG_DB_SLAVE_HOST || env.LOG_DB_HOST || '127.0.0.1',
  /** 从库端口 */
  DB_SLAVE_PORT: Number(env.LOG_DB_SLAVE_PORT) || Number(env.LOG_DB_PORT) || 5432,
};

/** Sqlite配置类型 */
export interface SqliteConfig {
  /** 数据库类型 */
  DB_TYPE: string;
  /** 数据库地址 */
  DB_DATABASE: string;
}

/** sqlite 配置 */
const sqliteConfig: SqliteConfig = {
  // 数据库类型
  DB_TYPE: 'sqlite',
  //  数据库地址
  DB_DATABASE: join(process.cwd(), env.DB_DATABASE || 'sqlitedata/nest.db'),
};

/** sqlite 日志 */
const sqliteLogger: SqliteConfig = {
  // 数据库类型
  DB_TYPE: 'sqlite',
  //  数据库地址
  DB_DATABASE: join(process.cwd(), env.LOG_DB_DATABASE || 'sqlitedata/nest-logger.db'),
};

/** 数据库配置 */
let dbConfig: MysqlConfig | SqliteConfig | PgConfig;
/** 日志配置 */
let dbLogger: MysqlConfig | SqliteConfig | PgConfig;

const DB_TYPE = env.DB_TYPE;
const LOG_DB_TYPE = env.LOG_DB_TYPE;
dbConfig = DB_TYPE === 'sqlite' ? sqliteConfig : DB_TYPE === 'postgres' ? pgConfig : mysqlConfig;
dbLogger =
  LOG_DB_TYPE === 'sqlite' ? sqliteLogger : LOG_DB_TYPE === 'postgres' ? pgLogger : mysqlLogger;

export default {
  dbConfig,
  dbLogger,
};
