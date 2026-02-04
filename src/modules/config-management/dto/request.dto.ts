import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateConfigDto {
  @IsString()
  key: string;

  value: any;

  @IsString()
  @IsOptional()
  description?: string;
}

export class BatchUpdateConfigDto {
  @ValidateNested({ each: true })
  @Type(() => UpdateConfigDto)
  configs: UpdateConfigDto[];
}

export class RollbackConfigDto {
  @IsString()
  version: string;
}

export class ConfigHistoryQueryDto {
  @IsString()
  @IsOptional()
  key?: string;

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
