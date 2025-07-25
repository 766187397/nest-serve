import { join } from "path";

// 获取环境变量
const env = process.env.NODE_ENV;

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
}

/** mysql 配置 */
const mysqlConfig: MysqlConfig = {
  /** 数据库类型 */
  DB_TYPE: "mysql",
  /** 数据地址 */
  DB_HOST: "127.0.0.1",
  /** 数据库端口 */
  DB_PORT: 3306,
  /** 数据库用户名 */
  DB_USER: "root",
  /** 数据库密码 */
  DB_PASSWORD: "123456",
  /** 数据库名称 */
  DB_DATABASE: "nest-serve",
};

/** mysql 日志 */
const mysqlLogger: MysqlConfig = {
  /** 数据库类型 */
  DB_TYPE: "mysql",
  /** 数据地址 */
  DB_HOST: "127.0.0.1",
  /** 数据库端口 */
  DB_PORT: 3306,
  /** 数据库用户名 */
  DB_USER: "root",
  /** 数据库密码 */
  DB_PASSWORD: "123456",
  /** 数据库名称 */
  DB_DATABASE: "nest-serve-logger",
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
  DB_TYPE: "sqlite",
  //  数据库地址
  DB_DATABASE: join(process.cwd(), "sqlitedata/nest.db"),
};

/** sqlite 日志 */
const sqliteLogger: SqliteConfig = {
  // 数据库类型
  DB_TYPE: "sqlite",
  //  数据库地址
  DB_DATABASE: join(process.cwd(), "sqlitedata/nest-logger.db"),
};

/** 数据库配置 */
let dbConfig: MysqlConfig | SqliteConfig;
/** 日志配置 */
let dbLogger: MysqlConfig | SqliteConfig;

if (env?.search("sqlitedb") !== -1) {
  dbConfig = sqliteConfig;
  dbLogger = sqliteLogger;
} else {
  dbConfig = mysqlConfig;
  dbLogger = mysqlLogger;
}

export default {
  dbConfig,
  dbLogger,
};
