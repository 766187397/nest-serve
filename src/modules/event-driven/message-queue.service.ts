import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { EventBusService, Event } from './event-bus.service';
import { getEventDrivenConfig } from '@/config/event-driven';

@Injectable()
export class MessageQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(MessageQueueService.name);
  private readonly config = getEventDrivenConfig(
    new (require('@nestjs/config').ConfigService)()
  );

  constructor(
    @InjectQueue('events') private readonly eventsQueue: Queue,
    private readonly eventBusService: EventBusService
  ) {}

  onModuleDestroy() {
    this.logger.log('Message queue service destroyed');
  }

  /**
   * 将事件添加到消息队列
   * @param {Event} event - 事件对象
   * @returns {Promise<Job>} 队列任务
   */
  async addEventToQueue(event: Event): Promise<Job> {
    if (!this.config.asyncProcessing) {
      this.logger.warn('Async processing is disabled, event will not be queued');
      throw new Error('Async processing is disabled');
    }

    try {
      const job = await this.eventsQueue.add(
        'process-event',
        {
          eventId: event.id,
          eventName: event.eventName,
          payload: event.payload,
          correlationId: event.correlationId,
        },
        {
          attempts: this.config.retryAttempts,
          backoff: {
            type: 'exponential',
            delay: this.config.retryDelayMs,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        }
      );

      this.logger.log(`Event added to queue: ${event.eventName} (job id: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add event to queue: ${event.eventName}`, error.stack);
      throw error;
    }
  }

  /**
   * 批量添加事件到消息队列
   * @param {Event[]} events - 事件数组
   * @returns {Promise<Job[]>} 队列任务数组
   */
  async addEventsToQueue(events: Event[]): Promise<Job[]> {
    if (!this.config.asyncProcessing) {
      this.logger.warn('Async processing is disabled, events will not be queued');
      throw new Error('Async processing is disabled');
    }

    try {
      const jobs = await Promise.all(
        events.map((event) => this.addEventToQueue(event))
      );

      this.logger.log(`Batch added ${events.length} events to queue`);
      return jobs;
    } catch (error) {
      this.logger.error('Failed to batch add events to queue', error.stack);
      throw error;
    }
  }

  /**
   * 获取队列统计信息
   * @returns {Promise<Object>} 队列统计信息
   */
  async getQueueStatistics(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.eventsQueue.getWaitingCount(),
      this.eventsQueue.getActiveCount(),
      this.eventsQueue.getCompletedCount(),
      this.eventsQueue.getFailedCount(),
      this.eventsQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused: await this.eventsQueue.isPaused(),
    };
  }

  /**
   * 获取队列任务列表
   * @param {string} status - 任务状态（waiting、active、completed、failed、delayed）
   * @param {number} start - 起始位置
   * @param {number} end - 结束位置
   * @returns {Promise<Job[]>} 任务列表
   */
  async getQueueJobs(
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed',
    start: number = 0,
    end: number = 10
  ): Promise<Job[]> {
    switch (status) {
      case 'waiting':
        return await this.eventsQueue.getWaiting(start, end);
      case 'active':
        return await this.eventsQueue.getActive(start, end);
      case 'completed':
        return await this.eventsQueue.getCompleted(start, end);
      case 'failed':
        return await this.eventsQueue.getFailed(start, end);
      case 'delayed':
        return await this.eventsQueue.getDelayed(start, end);
      default:
        return [];
    }
  }

  /**
   * 暂停队列
   */
  async pauseQueue(): Promise<void> {
    await this.eventsQueue.pause();
    this.logger.log('Event queue paused');
  }

  /**
   * 恢复队列
   */
  async resumeQueue(): Promise<void> {
    await this.eventsQueue.resume();
    this.logger.log('Event queue resumed');
  }

  /**
   * 清空队列
   */
  async cleanQueue(): Promise<void> {
    await this.eventsQueue.clean(0, 'completed');
    await this.eventsQueue.clean(0, 'failed');
    await this.eventsQueue.clean(0, 'delayed');
    this.logger.log('Event queue cleaned');
  }

  /**
   * 重试失败的任务
   * @param {string} jobId - 任务ID
   */
  async retryFailedJob(jobId: string): Promise<void> {
    const job = await this.eventsQueue.getJob(jobId);
    if (job) {
      await job.retry();
      this.logger.log(`Failed job retried: ${jobId}`);
    } else {
      this.logger.warn(`Job not found: ${jobId}`);
    }
  }

  /**
   * 删除任务
   * @param {string} jobId - 任务ID
   */
  async removeJob(jobId: string): Promise<void> {
    const job = await this.eventsQueue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Job removed: ${jobId}`);
    } else {
      this.logger.warn(`Job not found: ${jobId}`);
    }
  }
}
