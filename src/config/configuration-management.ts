import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

export interface ConfigurationManagementConfig {
  hotUpdateEnabled: boolean;
  versionRetentionDays: number;
  auditRetentionDays: number;
  maxVersionsPerConfig: number;
}

export const getConfigurationManagementConfig = (
  configService: ConfigService
): ConfigurationManagementConfig => ({
  hotUpdateEnabled: configService.get<boolean>('CONFIG_HOT_UPDATE_ENABLED', true),
  versionRetentionDays: configService.get<number>('CONFIG_VERSION_RETENTION_DAYS', 30),
  auditRetentionDays: configService.get<number>('CONFIG_AUDIT_RETENTION_DAYS', 90),
  maxVersionsPerConfig: configService.get<number>('CONFIG_MAX_VERSIONS_PER_CONFIG', 100),
});

export const ConfigurationManagementConfig = registerAs('configurationManagement', () =>
  getConfigurationManagementConfig(new (require('@nestjs/config').ConfigService)())
);
