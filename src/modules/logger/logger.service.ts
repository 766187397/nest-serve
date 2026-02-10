import { ApiResult } from '@/common/utils/result';
import { Injectable, Logger, Inject } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Log } from './entities/logger.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { FindLogDtoByPage } from './dto/index';
import { PageApiResult } from '@/types/public';
import { Request } from 'express';
import { buildCommonQuery, buildCommonSort, buildCommonPaging } from '@/common/utils/service.util';
import { LogQueueService } from './log-queue.service';
import { ConfigService } from '@nestjs/config';
import { getLoggerConfig, LoggerConfig } from '@/config/logger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);
  private readonly config: LoggerConfig;
  private readonly winstonLogger: WinstonLogger;
  private samplingCounter = 0;

  constructor(
    @InjectRepository(Log, 'logger')
    private logRepository: Repository<Log>,
    private readonly logQueueService: LogQueueService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) winstonLogger: WinstonLogger
  ) {
    this.config = getLoggerConfig(this.configService);
    this.winstonLogger = winstonLogger;
  }

  private shouldLog(level: LogLevel): boolean {
    const levelPriority = {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3,
    };
    return levelPriority[level] <= levelPriority[this.config.level];
  }

  private shouldSample(): boolean {
    if (!this.config.samplingEnabled) {
      return true;
    }
    this.samplingCounter++;
    const shouldSample = this.samplingCounter % Math.floor(1 / this.config.samplingRate) === 0;
    return shouldSample;
  }

  private getLogLevel(statusCode: string): LogLevel {
    const code = parseInt(statusCode, 10);
    if (code >= 500) return LogLevel.ERROR;
    if (code >= 400) return LogLevel.WARN;
    if (code >= 300) return LogLevel.INFO;
    return LogLevel.DEBUG;
  }

  /**
   * 创建日志
   * @param {Request} request 请求对象
   * @param {string} data 响应数据
   * @param {string} statusCode 状态码
   */
  async create(request: Request, data: string = '', statusCode: string = '200') {
    const logLevel = this.getLogLevel(statusCode);

    if (!this.shouldLog(logLevel)) {
      return;
    }

    if (!this.shouldSample()) {
      return;
    }

    const url: string = request.url || '';
    const platform: string = url.split('/')[3] || '';
    const { account = '', nickName = '' } = request.userInfo || {};
    const method = request.method || '';
    const {
      referer = '',
      'sec-ch-ua-platform': apiPlatform = '',
      'sec-ch-ua': browser = '',
    } = request.headers;
    let processedBrowser = browser as string;
    let processedApiPlatform = apiPlatform as string;
    try {
      processedBrowser = processedBrowser.replace(/"/g, '');
      processedApiPlatform = processedApiPlatform.replace(/"/g, '');
    } catch {
      processedApiPlatform = '';
      processedBrowser = '';
    }

    const IP =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.connection.remoteAddress ||
      request.ip ||
      '';

    const resData = JSON.stringify(data);
    const responseTime = request['startTime'] ? Date.now() - request['startTime'] : 0;

    try {
      const logData = {
        account,
        nickName,
        url,
        method,
        referer,
        apiPlatform: processedApiPlatform,
        platform,
        browser: processedBrowser,
        responseTime,
        resData,
        statusCode,
        IP,
      };

      if (!logData.resData) {
        logData.resData = '';
      }

      const logMessage = {
        ...logData,
        timestamp: new Date().toISOString(),
      };

      this.winstonLogger.log(logLevel, 'HTTP Request', logMessage);

      if (this.config.asyncEnabled) {
        await this.logQueueService.addLogToQueue(logData);
      } else {
        const logger = this.logRepository.create(logData);
        await this.logRepository.save(logger);
      }
    } catch (error) {
      this.logger.error('日志插入失败:', error);
    }
  }

  async findByPage(
    findLogDtoByPage: FindLogDtoByPage,
    platform: string = 'admin'
  ): Promise<ApiResult<PageApiResult<Log[]> | null>> {
    try {
      const { take, skip } = buildCommonPaging(findLogDtoByPage?.page, findLogDtoByPage?.pageSize);
      const where = buildCommonQuery(findLogDtoByPage);
      const order = buildCommonSort(findLogDtoByPage?.sort);

      const [data, total] = await this.logRepository.findAndCount({
        where: {
          ...where,
          platform: platform,
        },
        order: {
          ...order,
        },
        skip,
        take,
      });

      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<Log[]>>({
        data: {
          data,
          total,
          totalPages,
          page: findLogDtoByPage?.page || 1,
          pageSize: findLogDtoByPage?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error<null>((error as Error).message || '查询日志失败，请稍后重试');
    }
  }

  async deleteLogs(): Promise<void> {
    try {
      this.logger.log('定时任务删除日志');
      await this.logRepository.delete({
        createdAt: LessThan(dayjs().subtract(30, 'day').toDate()),
      });
    } catch (error) {
      this.logger.error('日志删除失败，请稍后再试', error);
      throw error;
    }
  }

  /**
   * 获取队列统计信息
   * @returns {Promise<Object>} 队列统计信息
   */
  async getQueueStats() {
    return await this.logQueueService.getQueueStats();
  }
}
