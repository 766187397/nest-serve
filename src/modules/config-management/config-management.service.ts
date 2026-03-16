import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { getConfigurationManagementConfig, ConfigurationManagementConfig } from '@/config/configuration-management';

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

@Injectable()
export class ConfigManagementService implements OnModuleInit {
  private readonly logger = new Logger(ConfigManagementService.name);
  private readonly config: ConfigurationManagementConfig;
  private readonly configs: Map<string, ConfigValue> = new Map();
  private readonly configVersions: Map<string, ConfigVersion[]> = new Map();
  private readonly configAudits: ConfigChangeAudit[] = [];
  private readonly configChangeListeners: Map<string, ((newValue: any) => void)[]> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.config = getConfigurationManagementConfig(new (require('@nestjs/config').ConfigService)());
  }

  onModuleInit() {
    this.logger.log('Configuration management service initialized');
    this.loadInitialConfigs();
  }

  /**
   * 加载初始配置
   */
  private loadInitialConfigs(): void {
    const initialConfigs = [
      { key: 'APP_NAME', value: 'NestJS Application', description: '应用名称' },
      { key: 'APP_PORT', value: 3000, description: '应用端口' },
      { key: 'NODE_ENV', value: 'development', description: '运行环境' },
    ];

    for (const config of initialConfigs) {
      this.createConfig(config.key, config.value, config.description, 'system');
    }

    this.logger.log(`Loaded ${initialConfigs.length} initial configurations`);
  }

  /**
   * 创建配置
   * @param {string} key - 配置键
   * @param {any} value - 配置值
   * @param {string} description - 配置描述
   * @param {string} changedBy - 修改人
   * @returns {ConfigValue} 配置值
   */
  createConfig(key: string, value: any, description?: string, changedBy: string = 'system'): ConfigValue {
    if (this.configs.has(key)) {
      throw new Error(`Configuration key "${key}" already exists`);
    }

    const configValue: ConfigValue = {
      key,
      value,
      description,
      updatedAt: new Date().toISOString(),
    };

    this.configs.set(key, configValue);

    const version = this.createVersion(key, value, description, changedBy);
    this.createAudit(version, key, undefined, value, 'create', changedBy);

    this.logger.log(`Configuration created: ${key}`);
    return configValue;
  }

  /**
   * 更新配置
   * @param {string} key - 配置键
   * @param {any} value - 新值
   * @param {string} description - 配置描述
   * @param {string} changedBy - 修改人
   * @returns {ConfigValue} 配置值
   */
  updateConfig(key: string, value: any, description?: string, changedBy: string = 'system'): ConfigValue {
    if (!this.configs.has(key)) {
      throw new Error(`Configuration key "${key}" does not exist`);
    }

    const oldValue = this.configs.get(key);
    const configValue: ConfigValue = {
      key,
      value,
      description: description || oldValue?.description,
      updatedAt: new Date().toISOString(),
    };

    this.configs.set(key, configValue);

    const version = this.createVersion(key, value, description, changedBy);
    this.createAudit(version, key, oldValue?.value, value, 'update', changedBy);

    if (this.config.hotUpdateEnabled) {
      this.notifyConfigChange(key, value);
    }

    this.logger.log(`Configuration updated: ${key}`);
    return configValue;
  }

  /**
   * 删除配置
   * @param {string} key - 配置键
   * @param {string} changedBy - 修改人
   */
  deleteConfig(key: string, changedBy: string = 'system'): void {
    if (!this.configs.has(key)) {
      throw new Error(`Configuration key "${key}" does not exist`);
    }

    const oldValue = this.configs.get(key);
    if (!oldValue) {
      throw new Error(`Configuration key "${key}" does not exist`);
    }

    const version = this.createVersion(key, oldValue.value, oldValue.description, changedBy);
    this.createAudit(version, key, oldValue.value, undefined, 'delete', changedBy);

    this.configs.delete(key);

    this.logger.log(`Configuration deleted: ${key}`);
  }

  /**
   * 获取配置
   * @param {string} key - 配置键
   * @returns {ConfigValue} 配置值
   */
  getConfig(key: string): ConfigValue {
    const config = this.configs.get(key);
    if (!config) {
      throw new Error(`Configuration key "${key}" does not exist`);
    }
    return config;
  }

  /**
   * 获取所有配置
   * @returns {ConfigValue[]} 配置列表
   */
  getAllConfigs(): ConfigValue[] {
    return Array.from(this.configs.values());
  }

  /**
   * 回滚配置到指定版本
   * @param {string} key - 配置键
   * @param {string} version - 版本号
   * @param {string} changedBy - 修改人
   * @returns {ConfigValue} 配置值
   */
  rollbackConfig(key: string, version: string, changedBy: string = 'system'): ConfigValue {
    const versions = this.configVersions.get(key);
    if (!versions) {
      throw new Error(`No versions found for configuration key "${key}"`);
    }

    const targetVersion = versions.find((v) => v.version === version);
    if (!targetVersion) {
      throw new Error(`Version "${version}" not found for configuration key "${key}"`);
    }

    const oldValue = this.configs.get(key);
    const configValue: ConfigValue = {
      key,
      value: targetVersion.value,
      description: targetVersion.description,
      updatedAt: new Date().toISOString(),
    };

    this.configs.set(key, configValue);

    const newVersion = this.createVersion(key, targetVersion.value, targetVersion.description, changedBy);
    this.createAudit(newVersion, key, oldValue?.value, targetVersion.value, 'rollback', changedBy, `Rollback to version ${version}`);

    if (this.config.hotUpdateEnabled) {
      this.notifyConfigChange(key, targetVersion.value);
    }

    this.logger.log(`Configuration rolled back: ${key} to version ${version}`);
    return configValue;
  }

  /**
   * 获取配置版本历史
   * @param {string} key - 配置键
   * @returns {ConfigVersion[]} 版本列表
   */
  getConfigVersions(key: string): ConfigVersion[] {
    const versions = this.configVersions.get(key);
    if (!versions) {
      return [];
    }
    return versions.sort((a, b) => b.changedAt.localeCompare(a.changedAt));
  }

  /**
   * 获取配置变更审计日志
   * @param {string} key - 配置键（可选）
   * @param {number} limit - 返回数量限制
   * @returns {ConfigChangeAudit[]} 审计日志列表
   */
  getConfigAudits(key?: string, limit: number = 100): ConfigChangeAudit[] {
    let audits = this.configAudits;

    if (key) {
      audits = audits.filter((audit) => audit.key === key);
    }

    audits.sort((a, b) => b.changedAt.localeCompare(a.changedAt));

    return audits.slice(0, limit);
  }

  /**
   * 订阅配置变更
   * @param {string} key - 配置键
   * @param {(newValue: any) => void} callback - 回调函数
   */
  subscribeConfigChange(key: string, callback: (newValue: any) => void): void {
    if (!this.configChangeListeners.has(key)) {
      this.configChangeListeners.set(key, []);
    }

    const listeners = this.configChangeListeners.get(key);
    if (listeners) {
      listeners.push(callback);
    }

    this.logger.log(`Subscribed to configuration change: ${key}`);
  }

  /**
   * 取消订阅配置变更
   * @param {string} key - 配置键
   * @param {(newValue: any) => void} callback - 回调函数
   */
  unsubscribeConfigChange(key: string, callback: (newValue: any) => void): void {
    const listeners = this.configChangeListeners.get(key);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
        this.logger.log(`Unsubscribed from configuration change: ${key}`);
      }
    }
  }

  /**
   * 获取配置管理状态
   * @returns {Object} 状态信息
   */
  getConfigStatus(): {
    totalConfigs: number;
    totalVersions: number;
    totalAudits: number;
    hotUpdateEnabled: boolean;
  } {
    let totalVersions = 0;
    for (const versions of this.configVersions.values()) {
      totalVersions += versions.length;
    }

    return {
      totalConfigs: this.configs.size,
      totalVersions,
      totalAudits: this.configAudits.length,
      hotUpdateEnabled: this.config.hotUpdateEnabled,
    };
  }

  /**
   * 清理过期配置版本
   * @param {number} retentionDays - 保留天数
   */
  cleanupOldVersions(retentionDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let cleanedCount = 0;
    for (const [key, versions] of this.configVersions.entries()) {
      const filteredVersions = versions.filter((v) => {
        const versionDate = new Date(v.changedAt);
        return versionDate >= cutoffDate;
      });

      if (filteredVersions.length < versions.length) {
        cleanedCount += versions.length - filteredVersions.length;
        this.configVersions.set(key, filteredVersions);
      }
    }

    this.logger.log(`Cleaned up ${cleanedCount} old configuration versions`);
  }

  /**
   * 创建配置版本
   * @param {string} key - 配置键
   * @param {any} value - 配置值
   * @param {string} description - 配置描述
   * @param {string} changedBy - 修改人
   * @returns {ConfigVersion} 版本信息
   */
  private createVersion(
    key: string,
    value: any,
    description?: string,
    changedBy: string = 'system'
  ): ConfigVersion {
    const version: ConfigVersion = {
      version: uuidv4(),
      key,
      value,
      description,
      changedBy,
      changedAt: new Date().toISOString(),
    };

    if (!this.configVersions.has(key)) {
      this.configVersions.set(key, []);
    }

    const versions = this.configVersions.get(key);
    if (versions) {
      versions.push(version);
    }

    return version;
  }

  /**
   * 创建配置变更审计
   * @param {ConfigVersion} version - 版本信息
   * @param {string} key - 配置键
   * @param {any} oldValue - 旧值
   * @param {any} newValue - 新值
   * @param {'create' | 'update' | 'delete' | 'rollback'} operation - 操作类型
   * @param {string} changedBy - 修改人
   * @param {string} reason - 原因
   */
  private createAudit(
    version: ConfigVersion,
    key: string,
    oldValue: any,
    newValue: any,
    operation: 'create' | 'update' | 'delete' | 'rollback',
    changedBy: string,
    reason?: string
  ): void {
    const audit: ConfigChangeAudit = {
      id: uuidv4(),
      version: version.version,
      key,
      oldValue,
      newValue,
      operation,
      changedBy,
      changedAt: new Date().toISOString(),
      reason,
    };

    this.configAudits.push(audit);
  }

  /**
   * 通知配置变更
   * @param {string} key - 配置键
   * @param {any} newValue - 新值
   */
  private notifyConfigChange(key: string, newValue: any): void {
    const listeners = this.configChangeListeners.get(key);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(newValue);
        } catch (error) {
          this.logger.error(`Error in configuration change listener for key "${key}"`, error.stack);
        }
      }
    }
  }
}
