import { ApiResultWrapperDto } from '@/common/dto/base';

/** 配置值接口 */
export interface ConfigValue {
  key: string;
  value: any;
  description?: string;
  updatedAt: string;
}

/** 配置版本接口 */
export interface ConfigVersion {
  version: string;
  key: string;
  value: any;
  description?: string;
  changedBy: string;
  changedAt: string;
}

/** 配置变更审计接口 */
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

/** 获取配置响应DTO */
export class GetConfigResponseDto extends ApiResultWrapperDto<ConfigValue> {
}

/** 获取所有配置响应DTO */
export class GetAllConfigsResponseDto extends ApiResultWrapperDto<ConfigValue[]> {
}

/** 获取配置版本响应DTO */
export class GetConfigVersionsResponseDto extends ApiResultWrapperDto<ConfigVersion[]> {
}

/** 获取配置审计响应DTO */
export class GetConfigAuditResponseDto extends ApiResultWrapperDto<ConfigChangeAudit[]> {
}

/** 配置状态响应DTO */
export class ConfigStatusResponseDto extends ApiResultWrapperDto<{
  totalConfigs: number;
  totalVersions: number;
  totalAudits: number;
  hotUpdateEnabled: boolean;
}> {
}
