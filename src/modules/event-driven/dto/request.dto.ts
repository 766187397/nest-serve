import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/** 发布事件请求DTO */
export class PublishEventDto {
  @IsString()
  eventName: string;

  @IsObject()
  @IsOptional()
  payload?: Record<string, any>;

  @IsString()
  @IsOptional()
  correlationId?: string;
}

/** 事件历史查询请求DTO */
export class EventHistoryQueryDto {
  @IsString()
  @IsOptional()
  eventName?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
