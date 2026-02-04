import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { getEventDrivenConfig, EventDrivenConfig } from '@/config/event-driven';

export interface Event {
  id: string;
  eventName: string;
  payload: Record<string, any>;
  correlationId?: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface EventListener {
  eventName: string;
  handler: (event: Event) => Promise<void> | void;
  priority: number;
}

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private readonly config: EventDrivenConfig;
  private readonly eventHistory: Map<string, Event> = new Map();
  private readonly eventListeners: Map<string, EventListener[]> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.config = getEventDrivenConfig(new (require('@nestjs/config').ConfigService)());
  }

  onModuleInit() {
    if (this.config.enabled) {
      this.logger.log('Event bus service initialized');
      this.startCleanupTask();
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * 发布事件
   * @param {string} eventName - 事件名称
   * @param {Record<string, any>} payload - 事件负载
   * @param {string} correlationId - 关联ID（用于追踪）
   * @returns {Event} 事件对象
   */
  async publish(
    eventName: string,
    payload: Record<string, any>,
    correlationId?: string
  ): Promise<Event> {
    if (!this.config.enabled) {
      this.logger.warn('Event bus is disabled, event will not be published');
      throw new Error('Event bus is disabled');
    }

    const event: Event = {
      id: uuidv4(),
      eventName,
      payload,
      correlationId: correlationId || uuidv4(),
      timestamp: Date.now(),
      status: 'pending',
    };

    this.eventHistory.set(event.id, event);

    try {
      this.eventEmitter.emit(eventName, event);
      this.logger.log(`Event published: ${eventName} (id: ${event.id})`);
      return event;
    } catch (error) {
      event.status = 'failed';
      event.error = error.message;
      this.eventHistory.set(event.id, event);
      this.logger.error(`Failed to publish event: ${eventName}`, error.stack);
      throw error;
    }
  }

  /**
   * 订阅事件
   * @param {string} eventName - 事件名称
   * @param {(event: Event) => Promise<void> | void} handler - 事件处理器
   * @param {number} priority - 优先级（数字越大优先级越高）
   */
  subscribe(
    eventName: string,
    handler: (event: Event) => Promise<void> | void,
    priority: number = 0
  ): void {
    if (!this.config.enabled) {
      this.logger.warn('Event bus is disabled, listener will not be registered');
      return;
    }

    const listener: EventListener = {
      eventName,
      handler,
      priority,
    };

    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }

    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.push(listener);
      listeners.sort((a, b) => b.priority - a.priority);
    }

    this.logger.log(`Listener registered for event: ${eventName} (priority: ${priority})`);
  }

  /**
   * 取消订阅事件
   * @param {string} eventName - 事件名称
   * @param {(event: Event) => Promise<void> | void} handler - 事件处理器
   */
  unsubscribe(eventName: string, handler: (event: Event) => Promise<void> | void): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.findIndex((l) => l.handler === handler);
      if (index !== -1) {
        listeners.splice(index, 1);
        this.logger.log(`Listener unregistered for event: ${eventName}`);
      }
    }
  }

  /**
   * 获取事件历史
   * @param {string} eventName - 事件名称（可选）
   * @param {string} status - 事件状态（可选）
   * @param {number} limit - 返回数量限制
   * @returns {Event[]} 事件列表
   */
  getEventHistory(eventName?: string, status?: string, limit: number = 100): Event[] {
    let events = Array.from(this.eventHistory.values());

    if (eventName) {
      events = events.filter((e) => e.eventName === eventName);
    }

    if (status) {
      events = events.filter((e) => e.status === status);
    }

    events.sort((a, b) => b.timestamp - a.timestamp);

    return events.slice(0, limit);
  }

  /**
   * 获取事件统计信息
   * @returns {Object} 统计信息
   */
  getEventStatistics(): {
    totalEvents: number;
    pendingEvents: number;
    processingEvents: number;
    completedEvents: number;
    failedEvents: number;
    averageProcessingTime: number;
    eventsByType: Record<string, number>;
  } {
    const events = Array.from(this.eventHistory.values());

    const totalEvents = events.length;
    const pendingEvents = events.filter((e) => e.status === 'pending').length;
    const processingEvents = events.filter((e) => e.status === 'processing').length;
    const completedEvents = events.filter((e) => e.status === 'completed').length;
    const failedEvents = events.filter((e) => e.status === 'failed').length;

    const completedEventTimes = events
      .filter((e) => e.status === 'completed')
      .map((e) => {
        const processingTime = e.timestamp;
        return processingTime;
      });

    const averageProcessingTime =
      completedEventTimes.length > 0
        ? completedEventTimes.reduce((a, b) => a + b, 0) / completedEventTimes.length
        : 0;

    const eventsByType: Record<string, number> = {};
    for (const event of events) {
      eventsByType[event.eventName] = (eventsByType[event.eventName] || 0) + 1;
    }

    return {
      totalEvents,
      pendingEvents,
      processingEvents,
      completedEvents,
      failedEvents,
      averageProcessingTime,
      eventsByType,
    };
  }

  /**
   * 清除事件历史
   * @param {string} eventName - 事件名称（可选，不指定则清除所有）
   */
  clearEventHistory(eventName?: string): void {
    if (eventName) {
      for (const [id, event] of this.eventHistory) {
        if (event.eventName === eventName) {
          this.eventHistory.delete(id);
        }
      }
      this.logger.log(`Event history cleared for event: ${eventName}`);
    } else {
      this.eventHistory.clear();
      this.logger.log('All event history cleared');
    }
  }

  /**
   * 获取事件状态
   * @returns {Object} 事件状态
   */
  getEventStatus(): {
    enabled: boolean;
    totalListeners: number;
    activeListeners: number;
    eventQueueSize: number;
    processingEvents: number;
  } {
    let totalListeners = 0;
    for (const listeners of this.eventListeners.values()) {
      totalListeners += listeners.length;
    }

    const processingEvents = Array.from(this.eventHistory.values()).filter(
      (e) => e.status === 'processing'
    ).length;

    return {
      enabled: this.config.enabled,
      totalListeners,
      activeListeners: totalListeners,
      eventQueueSize: this.eventHistory.size,
      processingEvents,
    };
  }

  /**
   * 启动清理任务
   * 定期清理过期的事件历史
   */
  private startCleanupTask(): void {
    const cleanupIntervalMs = this.config.eventHistoryRetentionHours * 60 * 60 * 1000;

    this.cleanupInterval = setInterval(() => {
      this.cleanupOldEvents();
    }, cleanupIntervalMs);

    this.logger.log(`Cleanup task started (interval: ${cleanupIntervalMs}ms)`);
  }

  /**
   * 清理过期事件
   */
  private cleanupOldEvents(): void {
    const retentionMs = this.config.eventHistoryRetentionHours * 60 * 60 * 1000;
    const now = Date.now();
    const cutoffTime = now - retentionMs;

    let cleanedCount = 0;
    for (const [id, event] of this.eventHistory) {
      if (event.timestamp < cutoffTime) {
        this.eventHistory.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} old events`);
    }
  }
}
