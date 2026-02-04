import { Controller, Get, Post, Delete, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventBusService } from './event-bus.service';
import { MessageQueueService } from './message-queue.service';
import { PublishEventDto, EventHistoryQueryDto } from './dto/request.dto';
import { EventHistoryResponseDto, EventStatisticsResponseDto, EventStatusResponseDto } from './dto/response.dto';

@ApiTags('事件驱动')
@Controller('event-driven')
export class EventDrivenController {
  constructor(
    private readonly eventBusService: EventBusService,
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Post('publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发布事件' })
  @ApiResponse({ status: 200, description: '事件发布成功' })
  async publishEvent(@Body() dto: PublishEventDto) {
    const event = await this.eventBusService.publish(
      dto.eventName,
      dto.payload || {},
      dto.correlationId
    );

    return {
      code: 200,
      message: '事件发布成功',
      data: event,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('history')
  @ApiOperation({ summary: '获取事件历史' })
  @ApiResponse({ status: 200, description: '获取成功', type: EventHistoryResponseDto })
  async getEventHistory(@Query() query: EventHistoryQueryDto) {
    const limit = query.limit ? parseInt(query.limit) : 100;
    const events = this.eventBusService.getEventHistory(
      query.eventName,
      query.status,
      limit
    );

    return {
      code: 200,
      message: '获取成功',
      data: events,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取事件统计信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: EventStatisticsResponseDto })
  async getEventStatistics() {
    const statistics = this.eventBusService.getEventStatistics();

    return {
      code: 200,
      message: '获取成功',
      data: statistics,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('status')
  @ApiOperation({ summary: '获取事件状态' })
  @ApiResponse({ status: 200, description: '获取成功', type: EventStatusResponseDto })
  async getEventStatus() {
    const status = this.eventBusService.getEventStatus();

    return {
      code: 200,
      message: '获取成功',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清除事件历史' })
  @ApiResponse({ status: 200, description: '清除成功' })
  async clearEventHistory(@Query('eventName') eventName?: string) {
    this.eventBusService.clearEventHistory(eventName);

    return {
      code: 200,
      message: '清除成功',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('queue/statistics')
  @ApiOperation({ summary: '获取队列统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getQueueStatistics() {
    const statistics = await this.messageQueueService.getQueueStatistics();

    return {
      code: 200,
      message: '获取成功',
      data: statistics,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('queue/jobs')
  @ApiOperation({ summary: '获取队列任务列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getQueueJobs(
    @Query('status') status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed',
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    const jobs = await this.messageQueueService.getQueueJobs(
      status,
      start ? parseInt(start) : 0,
      end ? parseInt(end) : 10
    );

    return {
      code: 200,
      message: '获取成功',
      data: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress(),
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('queue/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '暂停队列' })
  @ApiResponse({ status: 200, description: '暂停成功' })
  async pauseQueue() {
    await this.messageQueueService.pauseQueue();

    return {
      code: 200,
      message: '暂停成功',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('queue/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '恢复队列' })
  @ApiResponse({ status: 200, description: '恢复成功' })
  async resumeQueue() {
    await this.messageQueueService.resumeQueue();

    return {
      code: 200,
      message: '恢复成功',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('queue')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清空队列' })
  @ApiResponse({ status: 200, description: '清空成功' })
  async cleanQueue() {
    await this.messageQueueService.cleanQueue();

    return {
      code: 200,
      message: '清空成功',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('queue/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重试失败的任务' })
  @ApiResponse({ status: 200, description: '重试成功' })
  async retryFailedJob(@Body('jobId') jobId: string) {
    await this.messageQueueService.retryFailedJob(jobId);

    return {
      code: 200,
      message: '重试成功',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('queue/job')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除任务' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async removeJob(@Body('jobId') jobId: string) {
    await this.messageQueueService.removeJob(jobId);

    return {
      code: 200,
      message: '删除成功',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
