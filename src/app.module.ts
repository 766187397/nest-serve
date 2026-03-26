import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { DefaultDataModule } from './modules/defaultData/defaultData.module';
import { UploadModule } from './modules/upload/upload.module';
import { RolesModule } from './modules/roles/roles.module';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthGuard } from './modules/auth/auth.guard';
import { RoutesModule } from './modules/routes/routes.module';
import { LoggerModule } from './modules/logger/logger.module';
import { NoticeModule } from './modules/notice/notice.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { EmailModule } from './modules/email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleModule as CustomScheduleModule } from './modules/schedule/schedule.module';
import DBConfig, { type MysqlConfig, type PgConfig } from '@/config/db';
import { CacheModule } from './modules/cache/cache.module';
import { CacheInitModule } from './modules/cache/cache-init.module';
import { DocModule } from './modules/doc/doc.module';
import { ConnectionPoolMonitorModule } from './modules/connection-pool-monitor/connection-pool-monitor.module';
import { ConcurrencyControlModule } from './modules/concurrency-control/concurrency-control.module';
import { PerformanceMonitorModule } from './modules/performance-monitor/performance-monitor.module';
import { DatabaseOptimizationModule } from './modules/database-optimization/database-optimization.module';
import { EventDrivenModule } from './modules/event-driven/event-driven.module';
import { ConfigManagementModule } from './modules/config-management/config-management.module';
import { ExceptionTestModule } from './modules/exception-test/exception-test.module';

@Module({
  imports: [
    // 配置 ConfigModule 作为全局模块，并根据 NODE_ENV 加载相应的 .env 文件
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'dev'}`,
    }),
    // 配置定时任务模块
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        const dbType = DBConfig.dbConfig.DB_TYPE as 'mysql' | 'sqlite' | 'postgres';
        if (dbType === 'sqlite') {
          const config = DBConfig.dbConfig;
          return {
            type: dbType,
            database: config.DB_DATABASE,
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV !== 'production',
            entities: [join(__dirname, 'modules/**/!(*logger)*.entity.{ts,js}')],
            migrations: ['src/migrations/**/*{.ts,.js}'],
          };
        } else if (dbType === 'postgres') {
          const config = DBConfig.dbConfig as PgConfig;
          return {
            type: dbType,
            host: config.DB_HOST,
            port: config.DB_PORT,
            username: config.DB_USER,
            password: config.DB_PASSWORD,
            database: config.DB_DATABASE,
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV !== 'production',
            entities: [join(__dirname, 'modules/**/!(*logger)*.entity.{ts,js}')],
            migrations: ['src/migrations/**/*{.ts,.js}'],
            extra: {
              max: config.DB_POOL_SIZE || 10,
              min: config.DB_POOL_MIN || 2,
              connectionTimeoutMillis: config.DB_CONNECTION_TIMEOUT || 30000,
              idleTimeoutMillis: config.DB_IDLE_TIMEOUT || 300000,
            },
          };
        } else {
          const config = DBConfig.dbConfig as MysqlConfig;
          return {
            type: dbType,
            host: config.DB_HOST,
            port: config.DB_PORT,
            username: config.DB_USER,
            password: config.DB_PASSWORD,
            database: config.DB_DATABASE,
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV !== 'production',
            entities: [join(__dirname, 'modules/**/!(*logger)*.entity.{ts,js}')],
            migrations: ['src/migrations/**/*{.ts,.js}'],
            extra: {
              connectionLimit: config.DB_POOL_SIZE || 10,
              waitForConnections: true,
              queueLimit: 0,
              connectTimeout: config.DB_CONNECTION_TIMEOUT || 30000,
              acquireTimeout: config.DB_CONNECTION_TIMEOUT || 30000,
              idleTimeout: config.DB_IDLE_TIMEOUT || 300000,
              maxLifetime: config.DB_MAX_LIFETIME || 1800000,
            },
          };
        }
      },
    }),
    TypeOrmModule.forRootAsync({
      name: 'logger',
      imports: [ConfigModule],
      useFactory: () => {
        const dbType = DBConfig.dbLogger.DB_TYPE as 'mysql' | 'sqlite' | 'postgres';
        if (dbType === 'sqlite') {
          const config = DBConfig.dbLogger;
          return {
            type: dbType,
            database: config.DB_DATABASE,
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV !== 'production',
            entities: [join(__dirname, 'modules/logger/**/*.entity.{ts,js}')],
            migrations: ['src/migrations/**/*{.ts,.js}'],
          };
        } else if (dbType === 'postgres') {
          const config = DBConfig.dbLogger as PgConfig;
          return {
            type: dbType,
            host: config.DB_HOST,
            port: config.DB_PORT,
            username: config.DB_USER,
            password: config.DB_PASSWORD,
            database: config.DB_DATABASE,
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV !== 'production',
            entities: [join(__dirname, 'modules/logger/**/*.entity.{ts,js}')],
            migrations: ['src/migrations/**/*{.ts,.js}'],
            extra: {
              max: config.DB_POOL_SIZE || 10,
              min: config.DB_POOL_MIN || 2,
              connectionTimeoutMillis: config.DB_CONNECTION_TIMEOUT || 30000,
              idleTimeoutMillis: config.DB_IDLE_TIMEOUT || 300000,
            },
          };
        } else {
          const config = DBConfig.dbLogger as MysqlConfig;
          return {
            type: dbType,
            host: config.DB_HOST,
            port: config.DB_PORT,
            username: config.DB_USER,
            password: config.DB_PASSWORD,
            database: config.DB_DATABASE,
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV !== 'production',
            entities: [join(__dirname, 'modules/logger/**/*.entity.{ts,js}')],
            migrations: ['src/migrations/**/*{.ts,.js}'],
            extra: {
              connectionLimit: config.DB_POOL_SIZE || 10,
              waitForConnections: true,
              queueLimit: 0,
              connectTimeout: config.DB_CONNECTION_TIMEOUT || 30000,
              acquireTimeout: config.DB_CONNECTION_TIMEOUT || 30000,
              idleTimeout: config.DB_IDLE_TIMEOUT || 300000,
              maxLifetime: config.DB_MAX_LIFETIME || 1800000,
            },
          };
        }
      },
    }),
    UploadModule,
    AuthModule,
    DefaultDataModule,
    UsersModule,
    RolesModule,
    RoutesModule,
    LoggerModule,
    NoticeModule,
    DictionaryModule,
    EmailModule,
    CustomScheduleModule,
    CacheModule,
    CacheInitModule,
    DocModule,
    ConnectionPoolMonitorModule,
    ConcurrencyControlModule,
    PerformanceMonitorModule,
    DatabaseOptimizationModule,
    EventDrivenModule,
    ConfigManagementModule,
    ExceptionTestModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
