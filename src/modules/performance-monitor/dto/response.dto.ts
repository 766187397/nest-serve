import { ApiProperty } from '@nestjs/swagger';

export class MetricResponseDto {
  @ApiProperty({ description: '指标名称' })
  name: string;

  @ApiProperty({ description: '指标类型' })
  type: string;

  @ApiProperty({ description: '指标说明' })
  help: string;

  @ApiProperty({ description: '指标值' })
  value: number;

  @ApiProperty({ description: '标签' })
  labels?: Record<string, string>;
}

export class MetricsResponseDto {
  @ApiProperty({ description: 'Prometheus格式指标' })
  metrics: string;

  @ApiProperty({ description: '指标数量' })
  count: number;
}

export class TraceContextResponseDto {
  @ApiProperty({ description: '追踪ID' })
  traceId: string;

  @ApiProperty({ description: 'Span ID' })
  spanId: string;

  @ApiProperty({ description: '父Span ID' })
  parentSpanId?: string;

  @ApiProperty({ description: '服务名称' })
  serviceName: string;

  @ApiProperty({ description: '操作名称' })
  operationName: string;

  @ApiProperty({ description: '开始时间' })
  startTime: number;

  @ApiProperty({ description: '结束时间' })
  endTime?: number;

  @ApiProperty({ description: '持续时间(ms)' })
  duration?: number;

  @ApiProperty({ description: '标签' })
  tags?: Record<string, string>;

  @ApiProperty({ description: '日志' })
  logs?: Array<{ timestamp: number; level: string; message: string }>;
}

export class SpanResponseDto {
  @ApiProperty({ description: '追踪ID' })
  traceId: string;

  @ApiProperty({ description: 'Span ID' })
  spanId: string;

  @ApiProperty({ description: '父Span ID' })
  parentSpanId?: string;

  @ApiProperty({ description: '操作名称' })
  operationName: string;

  @ApiProperty({ description: '开始时间' })
  startTime: number;

  @ApiProperty({ description: '结束时间' })
  endTime?: number;

  @ApiProperty({ description: '持续时间(ms)' })
  duration?: number;

  @ApiProperty({ description: '标签' })
  tags: Record<string, string>;

  @ApiProperty({ description: '日志' })
  logs: Array<{ timestamp: number; level: string; message: string }>;
}

export class AlertResponseDto {
  @ApiProperty({ description: '告警ID' })
  id: string;

  @ApiProperty({ description: '告警类型' })
  type: string;

  @ApiProperty({ description: '严重程度' })
  severity: string;

  @ApiProperty({ description: '告警消息' })
  message: string;

  @ApiProperty({ description: '当前值' })
  value: number;

  @ApiProperty({ description: '阈值' })
  threshold: number;

  @ApiProperty({ description: '时间戳' })
  timestamp: number;

  @ApiProperty({ description: '是否已解决' })
  resolved?: boolean;
}

export class AlertRuleResponseDto {
  @ApiProperty({ description: '规则名称' })
  name: string;

  @ApiProperty({ description: '告警类型' })
  type: string;

  @ApiProperty({ description: '阈值' })
  threshold: number;

  @ApiProperty({ description: '比较方式' })
  comparison: string;

  @ApiProperty({ description: '严重程度' })
  severity: string;

  @ApiProperty({ description: '冷却时间(ms)' })
  cooldown: number;

  @ApiProperty({ description: '最后触发时间' })
  lastTriggered?: number;
}

export class PerformanceStatusResponseDto {
  @ApiProperty({ description: '活跃的追踪数量' })
  activeTraces: number;

  @ApiProperty({ description: '已完成的追踪数量' })
  completedTraces: number;

  @ApiProperty({ description: '活跃的告警数量' })
  activeAlerts: number;

  @ApiProperty({ description: '告警历史数量' })
  alertHistory: number;

  @ApiProperty({ description: '指标数量' })
  metricsCount: number;
}
