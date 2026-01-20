import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entities/logger.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { LogQueueProcessor } from './log-queue.processor';
import { LogQueueService } from './log-queue.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { getRedisConfig } from '@/config/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Log], 'logger'),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Record<string, unknown>, false>) => {
        const redisConfig = getRedisConfig(configService);
        return {
          redis: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db,
            keyPrefix: 'bull:',
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'log-queue',
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Record<string, unknown>, false>) => {
        const redisConfig = getRedisConfig(configService);
        return {
          type: 'single',
          options: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db,
            keyPrefix: redisConfig.keyPrefix,
          },
        };
      },
    }),
  ],
  controllers: [LoggerController],
  providers: [LoggerService, LogQueueProcessor, LogQueueService],
  exports: [LoggerService],
})
export class LoggerModule {}
