import { ApiProperty } from '@nestjs/swagger';
import { ApiResultWrapperDto } from '@/common/dto/base';
import { PageApiResult } from '@/types/public';

/** 指标响应DTO */
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

/** 指标集合响应DTO */
export class MetricsResponseDto {
  @ApiProperty({ description: 'Prometheus格式指标' })
  metrics: string;

  @ApiProperty({ description: '指标数量' })
  count: number;
}

/** Metrics 响应包装 DTO */
export class MetricsResponseWrapperDto extends ApiResultWrapperDto<MetricsResponseDto> {
  @ApiProperty({ description: '响应数据', type: MetricsResponseDto })
  declare data: MetricsResponseDto;
}

/** 追踪上下文响应DTO */
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

/** TraceContext 响应包装 DTO */
export class TraceContextResponseWrapperDto extends ApiResultWrapperDto<TraceContextResponseDto> {
  @ApiProperty({ description: '响应数据', type: TraceContextResponseDto })
  declare data: TraceContextResponseDto;
}

/** Span响应DTO */
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

/** 告警响应DTO */
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

/** Alert 响应包装 DTO */
export class AlertResponseWrapperDto extends ApiResultWrapperDto<AlertResponseDto> {
  @ApiProperty({ description: '响应数据', type: AlertResponseDto })
  declare data: AlertResponseDto;
}

/** 告警规则响应DTO */
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

/** AlertRule 响应包装 DTO */
export class AlertRuleResponseWrapperDto extends ApiResultWrapperDto<AlertRuleResponseDto> {
  @ApiProperty({ description: '响应数据', type: AlertRuleResponseDto })
  declare data: AlertRuleResponseDto;
}

/** 性能状态响应DTO */
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

/** PerformanceStatus 响应包装 DTO */
export class PerformanceStatusResponseWrapperDto extends ApiResultWrapperDto<PerformanceStatusResponseDto> {
  @ApiProperty({ description: '响应数据', type: PerformanceStatusResponseDto })
  declare data: PerformanceStatusResponseDto;
}

/** Span 列表响应包装 DTO */
export class SpanListResponseWrapperDto extends ApiResultWrapperDto<PageApiResult<SpanResponseDto[]>> {
  @ApiProperty({ description: '响应数据' })
  declare data: PageApiResult<SpanResponseDto[]>;
}

/** Alert 列表响应包装 DTO */
export class AlertListResponseWrapperDto extends ApiResultWrapperDto<PageApiResult<AlertResponseDto[]>> {
  @ApiProperty({ description: '响应数据' })
  declare data: PageApiResult<AlertResponseDto[]>;
}
