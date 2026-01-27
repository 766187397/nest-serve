import { ApiResultWrapperDto } from '@/common/dto/base';

export interface ConfigValue {
  key: string;
  value: any;
  description?: string;
  updatedAt: string;
}

export interface ConfigVersion {
  version: string;
  key: string;
  value: any;
  description?: string;
  changedBy: string;
  changedAt: string;
}

export interface ConfigChangeAudit {
  id: string;
  version: string;
  key: string;
  oldValue: any;
  newValue: any;
  operation: 'create' | 'update' | 'delete' | 'rollback';
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export class GetConfigResponseDto extends ApiResultWrapperDto<ConfigValue> {
}

export class GetAllConfigsResponseDto extends ApiResultWrapperDto<ConfigValue[]> {
}

export class GetConfigVersionsResponseDto extends ApiResultWrapperDto<ConfigVersion[]> {
}

export class GetConfigAuditResponseDto extends ApiResultWrapperDto<ConfigChangeAudit[]> {
}

export class ConfigStatusResponseDto extends ApiResultWrapperDto<{
  totalConfigs: number;
  totalVersions: number;
  totalAudits: number;
  hotUpdateEnabled: boolean;
}> {
}
