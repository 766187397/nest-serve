import { ApiProperty } from '@nestjs/swagger';

export class GetMetricsQueryDto {
  @ApiProperty({ description: '指标名称', required: false })
  name?: string;
}

export class GetTracesQueryDto {
  @ApiProperty({ description: '追踪ID', required: false })
  traceId?: string;

  @ApiProperty({ description: '操作名称', required: false })
  operationName?: string;

  @ApiProperty({ description: '开始时间', required: false })
  startTime?: number;

  @ApiProperty({ description: '结束时间', required: false })
  endTime?: number;

  @ApiProperty({ description: '最小持续时间(ms)', required: false })
  minDuration?: number;

  @ApiProperty({ description: '最大持续时间(ms)', required: false })
  maxDuration?: number;

  @ApiProperty({ description: '页码', required: false, default: 1 })
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  pageSize?: number;
}

export class GetAlertsQueryDto {
  @ApiProperty({ description: '告警类型', required: false, enum: ['qps', 'response_time', 'error_rate', 'cpu_usage', 'memory_usage'] })
  type?: string;

  @ApiProperty({ description: '严重程度', required: false, enum: ['info', 'warning', 'critical'] })
  severity?: string;

  @ApiProperty({ description: '是否只返回未解决的告警', required: false })
  unresolved?: boolean;
}

export class ResolveAlertDto {
  @ApiProperty({ description: '告警ID' })
  alertId: string;
}

export class CreateAlertRuleDto {
  @ApiProperty({ description: '规则名称' })
  name: string;

  @ApiProperty({ description: '告警类型', enum: ['qps', 'response_time', 'error_rate', 'cpu_usage', 'memory_usage'] })
  type: string;

  @ApiProperty({ description: '阈值' })
  threshold: number;

  @ApiProperty({ description: '比较方式', enum: ['greater_than', 'less_than', 'equals'] })
  comparison: string;

  @ApiProperty({ description: '严重程度', enum: ['info', 'warning', 'critical'] })
  severity: string;

  @ApiProperty({ description: '冷却时间(ms)', required: false })
  cooldown?: number;
}
