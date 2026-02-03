import { ConfigService } from '@nestjs/config';

export interface LoggerConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  asyncEnabled: boolean;
  samplingEnabled: boolean;
  samplingRate: number;
  queueName: string;
  consoleEnabled: boolean;
  fileEnabled: boolean;
  filePath: string;
  maxFileSize: number;
  maxFiles: number;
  retentionDays: number;
}

export const getLoggerConfig = (configService: ConfigService): LoggerConfig => {
  const nodeEnv = configService.get<string>('NODE_ENV') || 'dev';

  return {
    level:
      (configService.get<string>('LOG_LEVEL') as 'error' | 'warn' | 'info' | 'debug') ||
      (nodeEnv === 'production' ? 'info' : 'debug'),
    asyncEnabled: configService.get<string>('LOG_ASYNC_ENABLED') !== 'false',
    samplingEnabled: configService.get<string>('LOG_SAMPLING_ENABLED') === 'true',
    samplingRate: configService.get<number>('LOG_SAMPLING_RATE') || 0.1,
    queueName: configService.get<string>('LOG_QUEUE_NAME') || 'log-queue',
    consoleEnabled: configService.get<string>('LOG_CONSOLE_ENABLED') !== 'false',
    fileEnabled: configService.get<string>('LOG_FILE_ENABLED') === 'true',
    filePath: configService.get<string>('LOG_FILE_PATH') || './logs',
    maxFileSize: configService.get<number>('LOG_MAX_FILE_SIZE') || 20 * 1024 * 1024,
    maxFiles: configService.get<number>('LOG_MAX_FILES') || 14,
    retentionDays: configService.get<number>('LOG_RETENTION_DAYS') || 30,
  };
};
