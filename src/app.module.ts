import { Module } from "@nestjs/common";
import { UsersModule } from "./module/users/users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { Knife4jModule } from "./module/knife4j/knife4j.module";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./module/auth/auth.module";
import { DefaultDataModule } from "./module/defaultData/defaultData.module";
import { UploadModule } from "./module/upload/upload.module";
import { RolesModule } from "./module/roles/roles.module";
import { RolesGuard } from "./module/roles/roles.guard";
import { AuthGuard } from "./module/auth/auth.guard";
import { RoutesModule } from "./module/routes/routes.module";
import { LoggerModule } from "./module/logger/logger.module";
import { NoticeModule } from "./module/notice/notice.module";
import { DictionaryModule } from "./module/dictionary/dictionary.module";
import { ChataiModule } from "./module/chatai/chatai.module";
import { EmailModule } from "./module/email/email.module";
import DBConfig, { type MysqlConfig, type SqliteConfig } from "@/config/db";

@Module({
  imports: [
    // 配置 ConfigModule 作为全局模块，并根据 NODE_ENV 加载相应的 .env 文件
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "dev"}`,
    }),
    TypeOrmModule.forRootAsync({
      // name: "data",
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = DBConfig.dbConfig.DB_TYPE as "mysql" | "sqlite";
        if (dbType === "sqlite") {
          const config = DBConfig.dbConfig as SqliteConfig;
          return {
            type: dbType,
            database: config.DB_DATABASE,
            synchronize: process.env.NODE_ENV !== "production", // 开发环境可以为 true，生产环境为 false
            logging: process.env.NODE_ENV !== "production", // 开发环境启用日志
            entities: [join(__dirname, "module/**/!(*logger)*.entity.{ts,js}")], // 匹配非logger所有 .entity.ts 或 .entity.js 文件
            migrations: ["src/migrations/**/*{.ts,.js}"], // 迁移路径
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
            synchronize: process.env.NODE_ENV !== "production", // 开发环境可以为 true，生产环境为 false
            logging: process.env.NODE_ENV !== "production", // 开发环境启用日志
            entities: [join(__dirname, "module/**/!(*logger)*.entity.{ts,js}")], // 匹配非logger所有 .entity.ts 或 .entity.js 文件
            migrations: ["src/migrations/**/*{.ts,.js}"], // 迁移路径
          };
        }
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      name: "logger",
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = DBConfig.dbConfig.DB_TYPE as "mysql" | "sqlite";
        if (dbType === "sqlite") {
          const config = DBConfig.dbLogger as SqliteConfig;
          return {
            type: dbType,
            database: config.DB_DATABASE,
            synchronize: process.env.NODE_ENV !== "production", // 开发环境可以为 true，生产环境为 false
            logging: process.env.NODE_ENV !== "production", // 开发环境启用日志
            entities: [join(__dirname, "module/logger/**/*.entity.{ts,js}")], // 日志模块的实体
            migrations: ["src/migrations/**/*{.ts,.js}"], // 迁移路径
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
            synchronize: process.env.NODE_ENV !== "production", // 开发环境可以为 true，生产环境为 false
            logging: process.env.NODE_ENV !== "production", // 开发环境启用日志
            entities: [join(__dirname, "module/logger/**/*.entity.{ts,js}")], // 日志模块的实体
            migrations: ["src/migrations/**/*{.ts,.js}"], // 迁移路径
          };
        }
      },
      inject: [ConfigService],
    }),
    UsersModule,
    Knife4jModule,
    AuthModule,
    DefaultDataModule,
    UploadModule,
    RolesModule,
    RoutesModule,
    LoggerModule,
    NoticeModule,
    DictionaryModule,
    ChataiModule,
    EmailModule,
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
