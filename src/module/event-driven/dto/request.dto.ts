import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
