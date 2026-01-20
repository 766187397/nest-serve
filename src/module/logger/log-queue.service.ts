import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Log } from './entities/logger.entity';

export interface LogData {
  account: string;
  nickName: string;
  url: string;
  method: string;
  referer: string;
  apiPlatform: string;
  platform: string;
  browser: string;
  responseTime: number;
  resData: string;
  statusCode: string;
  IP: string;
}

@Injectable()
export class LogQueueService {
  private readonly logger = new Logger(LogQueueService.name);

  constructor(@InjectQueue('log-queue') private logQueue: Queue<LogData>) {}

  async addLogToQueue(logData: LogData): Promise<void> {
    try {
      await this.logQueue.add('process-log', logData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      });
    } catch (error) {
      this.logger.error('Failed to add log to queue:', error);
    }
  }

  async getQueueStats() {
    const waiting = await this.logQueue.getWaiting();
    const active = await this.logQueue.getActive();
    const completed = await this.logQueue.getCompleted();
    const failed = await this.logQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }
}
