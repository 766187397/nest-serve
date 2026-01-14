import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, Max, Min } from 'class-validator';
import { CreateBaseDto } from '@/common/dto/base';

export class CreateScheduleDto extends CreateBaseDto {
  @ApiProperty({ description: '任务名称', example: '清理日志' })
  @IsNotEmpty({ message: '任务名称不能为空' })
  @IsString({ message: '任务名称必须为字符串' })
  name: string;

  @ApiProperty({ description: '任务描述', required: false, example: '每月1号清理30天前的日志' })
  @IsOptional()
  @IsString({ message: '任务描述必须为字符串' })
  description?: string;

  @ApiProperty({ description: 'Cron表达式', example: '0 0 0 1 * *' })
  @IsNotEmpty({ message: 'Cron表达式不能为空' })
  @IsString({ message: 'Cron表达式必须为字符串' })
  cronExpression: string;

  @ApiProperty({ description: '内部任务标识', example: 'deleteLogs' })
  @IsNotEmpty({ message: '内部任务标识不能为空' })
  @IsString({ message: '内部任务标识必须为字符串' })
  jobName: string;

  @ApiProperty({
    description: '任务执行超时时间（秒）',
    required: false,
    default: 300,
    example: 300,
  })
  @IsOptional()
  @IsNumber({}, { message: '超时时间必须为数字' })
  @Min(1, { message: '超时时间必须大于0' })
  @Max(3600, { message: '超时时间不能超过3600秒' })
  timeout?: number;

  @ApiProperty({ description: '失败重试次数', required: false, default: 0, example: 3 })
  @IsOptional()
  @IsNumber({}, { message: '重试次数必须为数字' })
  @Min(0, { message: '重试次数不能小于0' })
  @Max(10, { message: '重试次数不能超过10次' })
  retryCount?: number;

  @ApiProperty({ description: '重试间隔（秒）', required: false, default: 60, example: 60 })
  @IsOptional()
  @IsNumber({}, { message: '重试间隔必须为数字' })
  @Min(1, { message: '重试间隔必须大于0' })
  @Max(600, { message: '重试间隔不能超过600秒' })
  retryInterval?: number;
}
