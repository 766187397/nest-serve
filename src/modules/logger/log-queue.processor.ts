import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/logger.entity';

@Processor('log-queue')
export class LogQueueProcessor {
  private readonly logger = new Logger(LogQueueProcessor.name);

  constructor(
    @InjectRepository(Log, 'logger')
    private logRepository: Repository<Log>
  ) {}

  @Process('process-log')
  async handleLog(job: Job<any>): Promise<void> {
    const logData = job.data;

    try {
      const log = this.logRepository.create(logData);
      await this.logRepository.save(log);
      this.logger.debug(`Log saved successfully: ${logData.url}`);
    } catch (error) {
      this.logger.error(`Failed to save log: ${error.message}`);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`);
  }
}
