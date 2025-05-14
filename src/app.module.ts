import { Module } from "@nestjs/common";
import { UsersModule } from "./module/users/users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { Knife4jModule } from "./module/knife4j/knife4j.module";
import { ApiResultInterceptor } from "@/common/interceptor/api-result.interceptor";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule } from "./module/auth/auth.module";
import { DefaultDataModule } from "./module/default-data/default-data.module";
import { UploadModule } from "./module/upload/upload.module";
import { RolesModule } from "./module/roles/roles.module";
import { RolesGuard } from "./module/roles/roles.guard";

@Module({
  imports: [
    // 配置 ConfigModule 作为全局模块，并根据 NODE_ENV 加载相应的 .env 文件
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "dev"}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>("DB_TYPE") as "mysql" | "sqlite";
        if (dbType === "sqlite") {
          return {
            type: dbType,
            database: configService.get("DB_DATABASE"),
            synchronize: process.env.NODE_ENV !== "production", // 开发环境可以为 true，生产环境为 false
            logging: process.env.NODE_ENV !== "production", // 开发环境启用日志
            entities: [join(__dirname, "**", "*.entity{.ts,.js}")], // 匹配所有 .entity.ts 或 .entity.js 文件
            migrations: ["src/migrations/**/*{.ts,.js}"], // 迁移路径
          };
        } else {
          return {
            type: dbType,
            host: configService.get("DB_HOST"),
            port: configService.get<number>("DB_PORT"),
            username: configService.get("DB_USER"),
            password: configService.get("DB_PASSWORD"),
            database: configService.get("DB_DATABASE"),
            synchronize: process.env.NODE_ENV !== "production", // 开发环境可以为 true，生产环境为 false
            logging: process.env.NODE_ENV !== "production", // 开发环境启用日志
            entities: [join(__dirname, "**", "*.entity{.ts,.js}")], // 匹配所有 .entity.ts 或 .entity.js 文件
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
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResultInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
