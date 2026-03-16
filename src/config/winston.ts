import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';
import { getLoggerConfig } from './logger';
import { WinstonModuleOptions } from 'nest-winston';

export const createWinstonConfig = (configService: ConfigService): WinstonModuleOptions => {
  const loggerConfig = getLoggerConfig(configService);

  const transports: winston.transport[] = [];

  if (loggerConfig.consoleEnabled) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, trace }) => {
            return `${timestamp} [${context || 'Application'}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
          })
        ),
      })
    );
  }

  if (loggerConfig.fileEnabled) {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
        const logData: Record<string, unknown> = {
          timestamp,
          context: context || 'Application',
          level,
          message,
          ...meta,
        };
        if (trace) {
          logData.trace = trace;
        }
        return JSON.stringify(logData);
      })
    );

    transports.push(
      new DailyRotateFile({
        dirname: loggerConfig.filePath,
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: loggerConfig.maxFileSize,
        maxFiles: loggerConfig.maxFiles,
        format: logFormat,
        level: loggerConfig.level,
      })
    );

    transports.push(
      new DailyRotateFile({
        dirname: loggerConfig.filePath,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: loggerConfig.maxFileSize,
        maxFiles: loggerConfig.maxFiles,
        format: logFormat,
        level: 'error',
      })
    );
  }

  return {
    level: loggerConfig.level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true })
    ),
    transports,
  };
};
