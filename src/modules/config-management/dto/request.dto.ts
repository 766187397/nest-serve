import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/** 更新配置请求DTO */
export class UpdateConfigDto {
  @IsString()
  key: string;

  value: any;

  @IsString()
  @IsOptional()
  description?: string;
}

/** 批量更新配置请求DTO */
export class BatchUpdateConfigDto {
  @ValidateNested({ each: true })
  @Type(() => UpdateConfigDto)
  configs: UpdateConfigDto[];
}

/** 回滚配置请求DTO */
export class RollbackConfigDto {
  @IsString()
  version: string;
}

/** 配置历史查询请求DTO */
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
