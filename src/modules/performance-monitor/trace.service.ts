import { Injectable, Logger, Scope, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';
import { getPerformanceMonitorConfig, TraceConfig } from '@/config/performance-monitor';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags?: Record<string, string>;
  logs?: Array<{ timestamp: number; level: string; message: string }>;
}

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, string>;
  logs: Array<{ timestamp: number; level: string; message: string }>;
}

@Injectable({ scope: Scope.DEFAULT })
export class TraceService implements OnModuleInit {
  private readonly logger = new Logger(TraceService.name);
  private readonly config: TraceConfig;
  private readonly storage = new AsyncLocalStorage<TraceContext>();
  private readonly activeSpans: Map<string, Span> = new Map();
  private readonly completedSpans: Span[] = [];

  constructor() {
    this.config = getPerformanceMonitorConfig(new (require('@nestjs/config').ConfigService)()).trace;
  }

  onModuleInit(): void {
    this.logger.log('TraceService initialized');
  }

  startTrace(operationName: string, tags?: Record<string, string>): TraceContext {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();
    const startTime = Date.now();

    const context: TraceContext = {
      traceId,
      spanId,
      serviceName: this.config.serviceName,
      operationName,
      startTime,
      tags,
      logs: [],
    };

    this.storage.enterWith(context);

    if (this.config.enabled) {
      const span: Span = {
        traceId,
        spanId,
        operationName,
        startTime,
        tags: tags || {},
        logs: [],
      };
      this.activeSpans.set(spanId, span);
    }

    return context;
  }

  endTrace(): void {
    const context = this.storage.getStore();
    if (!context) {
      return;
    }

    const endTime = Date.now();
    const duration = endTime - context.startTime;

    context.endTime = endTime;
    context.duration = duration;

    if (this.config.enabled) {
      const span = this.activeSpans.get(context.spanId);
      if (span) {
        span.endTime = endTime;
        span.duration = duration;
        this.completedSpans.push(span);
        this.activeSpans.delete(context.spanId);
      }
    }
  }

  startChildSpan(operationName: string, tags?: Record<string, string>): TraceContext {
    const parentContext = this.storage.getStore();
    if (!parentContext) {
      return this.startTrace(operationName, tags);
    }

    const spanId = this.generateSpanId();
    const startTime = Date.now();

    const context: TraceContext = {
      traceId: parentContext.traceId,
      spanId,
      parentSpanId: parentContext.spanId,
      serviceName: this.config.serviceName,
      operationName,
      startTime,
      tags,
      logs: [],
    };

    this.storage.enterWith(context);

    if (this.config.enabled) {
      const span: Span = {
        traceId: parentContext.traceId,
        spanId,
        parentSpanId: parentContext.spanId,
        operationName,
        startTime,
        tags: tags || {},
        logs: [],
      };
      this.activeSpans.set(spanId, span);
    }

    return context;
  }

  getCurrentTrace(): TraceContext | undefined {
    return this.storage.getStore();
  }

  addTag(key: string, value: string): void {
    const context = this.storage.getStore();
    if (!context) {
      return;
    }

    if (!context.tags) {
      context.tags = {};
    }

    context.tags[key] = value;

    if (this.config.enabled) {
      const span = this.activeSpans.get(context.spanId);
      if (span) {
        span.tags[key] = value;
      }
    }
  }

  addLog(level: string, message: string): void {
    const context = this.storage.getStore();
    if (!context) {
      return;
    }

    if (!context.logs) {
      context.logs = [];
    }

    context.logs.push({
      timestamp: Date.now(),
      level,
      message,
    });

    if (this.config.enabled) {
      const span = this.activeSpans.get(context.spanId);
      if (span) {
        span.logs.push({
          timestamp: Date.now(),
          level,
          message,
        });
      }
    }
  }

  getActiveSpans(): Span[] {
    return Array.from(this.activeSpans.values());
  }

  getCompletedSpans(): Span[] {
    return [...this.completedSpans];
  }

  clearCompletedSpans(): void {
    this.completedSpans.length = 0;
    this.logger.log('Completed spans cleared');
  }

  cleanupExpiredSpans(maxAge: number = 300000): void {
    const now = Date.now();
    const expiredSpans: string[] = [];

    for (const [spanId, span] of this.activeSpans.entries()) {
      if (now - span.startTime > maxAge) {
        expiredSpans.push(spanId);
      }
    }

    for (const spanId of expiredSpans) {
      this.activeSpans.delete(spanId);
    }

    if (expiredSpans.length > 0) {
      this.logger.log(`Cleaned up ${expiredSpans.length} expired spans`);
    }
  }

  private generateTraceId(): string {
    return uuidv4().substring(0, this.config.maxTraceIdLength);
  }

  private generateSpanId(): string {
    return uuidv4().substring(0, 16);
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  cleanupExpiredTraces(): void {
    this.cleanupExpiredSpans(300000);
  }
}
