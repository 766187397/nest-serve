import { ApiProperty } from '@nestjs/swagger';
import { ApiResultWrapperDto } from '@/common/dto/base';

/** 定时任务响应DTO */
export class ScheduleResponseDto {
  @ApiProperty({ description: '任务ID', example: '1' })
  id: string;

  @ApiProperty({ description: '任务名称', example: '清理日志' })
  name: string;

  @ApiProperty({ description: '任务描述', example: '清理过期日志', required: false })
  description?: string;

  @ApiProperty({ description: 'Cron表达式', example: '0 0 0 * * *' })
  cronExpression: string;

  @ApiProperty({ description: '内部任务标识', example: 'cleanLogs' })
  jobName: string;

  @ApiProperty({ description: '上次执行时间', example: '2024-01-01T00:00:00.000Z', required: false })
  lastExecutionTime?: Date;

  @ApiProperty({ description: '下次执行时间', example: '2024-01-02T00:00:00.000Z', required: false })
  nextExecutionTime?: Date;

  @ApiProperty({ description: '任务执行超时时间（秒）', example: 300 })
  timeout: number;

  @ApiProperty({ description: '失败重试次数', example: 0 })
  retryCount: number;

  @ApiProperty({ description: '重试间隔（秒）', example: 60 })
  retryInterval: number;

  @ApiProperty({ description: '排序', example: 1 })
  sort: number;

  @ApiProperty({ description: '状态 0禁用 1启用', example: 1 })
  status: number;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date | string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date | string;
}

/** 定时任务响应包装 DTO */
export class ScheduleResponseWrapperDto extends ApiResultWrapperDto<ScheduleResponseDto> {
  @ApiProperty({ description: '响应数据', type: ScheduleResponseDto })
  declare data: ScheduleResponseDto;
}

/** 定时任务列表响应包装 DTO */
export class ScheduleListResponseWrapperDto extends ApiResultWrapperDto<ScheduleResponseDto[]> {
  @ApiProperty({ description: '响应数据', type: [ScheduleResponseDto] })
  declare data: ScheduleResponseDto[];
}

/** 定时任务执行日志响应DTO */
export class ScheduleLogResponseDto {
  @ApiProperty({ description: '日志ID', example: '1' })
  id: string;

  @ApiProperty({ description: '关联的任务ID', example: '1' })
  scheduleId: string;

  @ApiProperty({ description: '执行时间', example: '2024-01-01T00:00:00.000Z' })
  executionTime: Date;

  @ApiProperty({ description: '执行状态', example: 'success' })
  executionStatus: string;

  @ApiProperty({ description: '执行耗时（毫秒）', example: 1000 })
  duration: number;

  @ApiProperty({ description: '错误信息', example: '任务执行失败', required: false })
  errorMessage?: string;

  @ApiProperty({ description: '排序', example: 1 })
  sort: number;

  @ApiProperty({ description: '状态 0禁用 1启用', example: 1 })
  status: number;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date | string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date | string;
}

/** 定时任务执行日志列表响应包装 DTO */
export class ScheduleLogListResponseWrapperDto extends ApiResultWrapperDto<ScheduleLogResponseDto[]> {
  @ApiProperty({ description: '响应数据', type: [ScheduleLogResponseDto] })
  declare data: ScheduleLogResponseDto[];
}