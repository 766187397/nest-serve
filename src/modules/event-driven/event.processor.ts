import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EventBusService } from './event-bus.service';

@Processor('events')
export class EventProcessor {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(private readonly eventBusService: EventBusService) {}

  @Process('process-event')
  async handleEvent(job: Job): Promise<void> {
    const { eventId, eventName, payload, correlationId } = job.data;

    this.logger.log(`Processing event: ${eventName} (event id: ${eventId}, job id: ${job.id})`);

    try {
      const eventHistory = this.eventBusService.getEventHistory();
      const event = eventHistory.find((e) => e.id === eventId);
      
      if (event) {
        event.status = 'processing';
      }

      await this.processEvent(eventName, payload, correlationId);

      if (event) {
        event.status = 'completed';
      }

      this.logger.log(`Event processed successfully: ${eventName} (event id: ${eventId})`);
    } catch (error) {
      const eventHistory = this.eventBusService.getEventHistory();
      const event = eventHistory.find((e) => e.id === eventId);
      
      if (event) {
        event.status = 'failed';
        event.error = error.message;
      }

      this.logger.error(`Failed to process event: ${eventName}`, error.stack);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}. Result: ${result}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}. Error: ${err.message}`, err.stack);
  }

  /**
   * 处理事件
   * @param {string} eventName - 事件名称
   * @param {Record<string, any>} payload - 事件负载
   * @param {string} correlationId - 关联ID
   */
  private async processEvent(
    eventName: string,
    payload: Record<string, any>,
    correlationId?: string
  ): Promise<void> {
    switch (eventName) {
      case 'user.created':
        await this.handleUserCreated(payload, correlationId);
        break;
      case 'user.updated':
        await this.handleUserUpdated(payload, correlationId);
        break;
      case 'user.deleted':
        await this.handleUserDeleted(payload, correlationId);
        break;
      case 'order.created':
        await this.handleOrderCreated(payload, correlationId);
        break;
      case 'order.paid':
        await this.handleOrderPaid(payload, correlationId);
        break;
      case 'order.completed':
        await this.handleOrderCompleted(payload, correlationId);
        break;
      case 'email.send':
        await this.handleEmailSend(payload, correlationId);
        break;
      case 'notification.send':
        await this.handleNotificationSend(payload, correlationId);
        break;
      default:
        this.logger.warn(`Unknown event type: ${eventName}`);
    }
  }

  /**
   * 处理用户创建事件
   */
  private async handleUserCreated(payload: Record<string, any>, correlationId?: string): Promise<void> {
    this.logger.log(`User created: ${payload.userId}, correlationId: ${correlationId}`);
  }

  /**
   * 处理用户更新事件
   */
  private async handleUserUpdated(payload: Record<string, any>, correlationId?: string): Promise<void> {
    this.logger.log(`User updated: ${payload.userId}, correlationId: ${correlationId}`);
  }

  /**
   * 处理用户删除事件
   */
  private async handleUserDeleted(payload: Record<string, any>, correlationId?: string): Promise<void> {
    this.logger.log(`User deleted: ${payload.userId}, correlationId: ${correlationId}`);
  }

  /**
   * 处理订单创建事件
   */
  private async handleOrderCreated(payload: Record<string, any>, correlationId?: string): Promise<void> {
    this.logger.log(`Order created: ${payload.orderId}, correlationId: ${correlationId}`);
  }

  /**
   * 处理订单支付事件
   */
  private async handleOrderPaid(payload: Record<string, any>, correlationId?: string): Promise<void> {
    this.logger.log(`Order paid: ${payload.orderId}, correlationId: ${correlationId}`);
  }

  /**
   * 处理订单完成事件
   */
  private async handleOrderCompleted(payload: Record<string, any>, correlationId?: string): Promise<void> {
    this.logger.log(`Order completed: ${payload.orderId}, correlationId: ${correlationId}`);
  }

  /**
   * 处理邮件发送事件
   */
  private async handleEmailSend(payload: Record<string, any>, correlationId?: string): Promise<void> {
    this.logger.log(`Email send: ${payload.email}, correlationId: ${correlationId}`);
  }

  /**
   * 处理通知发送事件
   */
  private async handleNotificationSend(payload: Record<string, any>, correlationId?: string): Promise<void> {
    this.logger.log(`Notification send: ${payload.userId}, correlationId: ${correlationId}`);
  }
}
