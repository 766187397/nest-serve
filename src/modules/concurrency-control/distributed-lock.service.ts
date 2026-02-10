import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { CacheService } from '@/common/service/cache.service';
import { getConcurrencyControlConfig, DistributedLockConfig } from '@/config/concurrency-control';
import { v4 as uuidv4 } from 'uuid';

export interface LockOptions {
  timeout?: number;
  retryDelay?: number;
  retryCount?: number;
}

export interface LockResult {
  success: boolean;
  lockId?: string;
  error?: Error;
}

@Injectable()
export class DistributedLockService implements OnModuleDestroy {
  private readonly logger = new Logger(DistributedLockService.name);
  private readonly config: DistributedLockConfig;
  private readonly activeLocks: Map<string, string> = new Map();

  constructor(private readonly cacheService: CacheService) {
    this.config = getConcurrencyControlConfig(new (require('@nestjs/config').ConfigService)()).distributedLock;
  }

  /**
   * 获取分布式锁
   * @param {string} key 锁的键
   * @param {LockOptions} options 锁的选项
   * @returns {Promise<LockResult>} 锁获取结果
   */
  async acquireLock(
    key: string,
    options: LockOptions = {}
  ): Promise<LockResult> {
    if (!this.config.enabled) {
      return { success: true };
    }

    const lockId = uuidv4();
    const timeout = options.timeout || this.config.lockTimeout;
    const retryDelay = options.retryDelay || this.config.retryDelay;
    const retryCount = options.retryCount || this.config.retryCount;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const success = await this.tryAcquireLock(key, lockId, timeout);

        if (success) {
          this.activeLocks.set(key, lockId);
          this.logger.debug(`Lock acquired for key: ${key}, lockId: ${lockId}`);
          return { success: true, lockId };
        }

        if (attempt < retryCount) {
          await this.sleep(retryDelay);
        }
      } catch (error) {
        this.logger.error(
          `Error acquiring lock for key ${key} (attempt ${attempt + 1}/${retryCount + 1}):`,
          error
        );
      }
    }

    this.logger.warn(`Failed to acquire lock for key: ${key} after ${retryCount + 1} attempts`);
    return {
      success: false,
      error: new Error(`Failed to acquire lock after ${retryCount + 1} attempts`),
    };
  }

  /**
   * 释放分布式锁
   * @param {string} key 锁的键
   * @param {string} lockId 锁的ID
   * @returns {Promise<boolean>} 是否成功释放
   */
  async releaseLock(key: string, lockId: string): Promise<boolean> {
    if (!this.config.enabled) {
      return true;
    }

    try {
      const activeLockId = this.activeLocks.get(key);

      if (activeLockId !== lockId) {
        this.logger.warn(`Attempted to release lock with invalid lockId for key: ${key}`);
        return false;
      }

      const success = await this.tryReleaseLock(key, lockId);

      if (success) {
        this.activeLocks.delete(key);
        this.logger.debug(`Lock released for key: ${key}, lockId: ${lockId}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error releasing lock for key ${key}:`, error);
      return false;
    }
  }

  /**
   * 延长锁的过期时间
   * @param {string} key 锁的键
   * @param {string} lockId 锁的ID
   * @param {number} timeout 新的超时时间
   * @returns {Promise<boolean>} 是否成功延长
   */
  async extendLock(
    key: string,
    lockId: string,
    timeout?: number
  ): Promise<boolean> {
    if (!this.config.enabled) {
      return true;
    }

    try {
      const activeLockId = this.activeLocks.get(key);

      if (activeLockId !== lockId) {
        this.logger.warn(`Attempted to extend lock with invalid lockId for key: ${key}`);
        return false;
      }

      const lockKey = this.getLockKey(key);
      const currentLockId = await this.cacheService.get<string>(lockKey);

      if (currentLockId !== lockId) {
        this.logger.warn(`Lock expired or changed for key: ${key}`);
        this.activeLocks.delete(key);
        return false;
      }

      const lockTimeout = timeout || this.config.lockTimeout;
      await this.cacheService.set(lockKey, lockId, lockTimeout);
      this.logger.debug(`Lock extended for key: ${key}, lockId: ${lockId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error extending lock for key ${key}:`, error);
      return false;
    }
  }

  async isLocked(key: string): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      const lockKey = this.getLockKey(key);
      return await this.cacheService.exists(lockKey);
    } catch (error) {
      this.logger.error(`Error checking lock status for key ${key}:`, error);
      return false;
    }
  }

  async executeWithLock<T>(
    key: string,
    fn: () => Promise<T>,
    options?: LockOptions
  ): Promise<T> {
    const lockResult = await this.acquireLock(key, options);

    if (!lockResult.success) {
      throw new Error(
        `Failed to acquire lock for key: ${key}. ${lockResult.error?.message || ''}`
      );
    }

    try {
      return await fn();
    } finally {
      if (lockResult.lockId) {
        await this.releaseLock(key, lockResult.lockId);
      }
    }
  }

  /**
   * 强制释放锁
   * @param {string} key 锁的键
   * @returns {Promise<boolean>} 是否成功释放
   */
  async forceReleaseLock(key: string): Promise<boolean> {
    if (!this.config.enabled) {
      return true;
    }

    try {
      const lockKey = this.getLockKey(key);
      await this.cacheService.del(lockKey);
      this.activeLocks.delete(key);
      this.logger.warn(`Force released lock for key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Error force releasing lock for key ${key}:`, error);
      return false;
    }
  }

  getActiveLocks(): string[] {
    return Array.from(this.activeLocks.keys());
  }

  onModuleDestroy() {
    this.logger.log('Releasing all active locks...');
    const keys = Array.from(this.activeLocks.keys());
    keys.forEach((key) => {
      const lockId = this.activeLocks.get(key);
      if (lockId) {
        this.releaseLock(key, lockId).catch((error) => {
          this.logger.error(`Error releasing lock for key ${key} on shutdown:`, error);
        });
      }
    });
  }

  private async tryAcquireLock(
    key: string,
    lockId: string,
    timeout: number
  ): Promise<boolean> {
    const lockKey = this.getLockKey(key);

    try {
      const exists = await this.cacheService.exists(lockKey);

      if (exists) {
        return false;
      }

      const success = await this.cacheService.set(lockKey, lockId, timeout);
      return success;
    } catch (error) {
      this.logger.error(`Error in tryAcquireLock for key ${key}:`, error);
      return false;
    }
  }

  private async tryReleaseLock(
    key: string,
    lockId: string
  ): Promise<boolean> {
    const lockKey = this.getLockKey(key);

    try {
      const currentLockId = await this.cacheService.get<string>(lockKey);

      if (currentLockId !== lockId) {
        return false;
      }

      await this.cacheService.del(lockKey);
      return true;
    } catch (error) {
      this.logger.error(`Error in tryReleaseLock for key ${key}:`, error);
      return false;
    }
  }

  private getLockKey(key: string): string {
    return `distributed-lock:${key}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
