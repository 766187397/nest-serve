import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { PageByParameter } from '@/common/dto/base';

/** 获取指标查询DTO */
export class GetMetricsQueryDto {
  @ApiProperty({ description: '指标名称', required: false })
  name?: string;
}

/** 获取追踪查询DTO */
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
}

/** 分页获取追踪查询DTO */
export class GetTracesQueryDtoByPage extends PartialType(IntersectionType(GetTracesQueryDto, PageByParameter)) {}

/** 获取告警查询DTO */
export class GetAlertsQueryDto {
  @ApiProperty({ description: '告警类型', required: false, enum: ['qps', 'response_time', 'error_rate', 'cpu_usage', 'memory_usage'] })
  type?: string;

  @ApiProperty({ description: '严重程度', required: false, enum: ['info', 'warning', 'critical'] })
  severity?: string;

  @ApiProperty({ description: '是否只返回未解决的告警', required: false })
  unresolved?: boolean;
}

/** 分页获取告警查询DTO */
export class GetAlertsQueryDtoByPage extends PartialType(IntersectionType(GetAlertsQueryDto, PageByParameter)) {}

/** 解决告警请求DTO */
export class ResolveAlertDto {
  @ApiProperty({ description: '告警ID' })
  alertId: string;
}

/** 创建告警规则请求DTO */
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
