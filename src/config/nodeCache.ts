import { Injectable } from '@nestjs/common';
import { CacheService } from '@/common/service/cache.service';

@Injectable()
export class NodeCacheService {
  constructor(private readonly cacheService: CacheService) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cacheService.get<T>(key);
    return value || undefined;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return await this.cacheService.set(key, value, ttl);
  }

  async del(key: string): Promise<boolean> {
    return await this.cacheService.del(key);
  }

  async flushAll(): Promise<boolean> {
    return await this.cacheService.flushAll();
  }

  async keys(): Promise<string[]> {
    return [];
  }

  async has(key: string): Promise<boolean> {
    return await this.cacheService.exists(key);
  }
}

/**
 * 邮箱验证码发送冷却时间（分钟）
 * @description 用于控制同一邮箱地址发送验证码的频率限制，防止频繁发送邮件
 * @example 用户发送验证码后，需要等待1分钟才能再次发送
 */
export const cacheTime = 1;

/**
 * 图形验证码缓存过期时间（秒）
 * @description 图形验证码在Redis中的存活时间，超过此时间后验证码自动失效
 * @example 用户获取验证码后，需要在2分钟内完成验证，否则验证码失效
 * @default 120秒（2分钟）
 */
export const CAPTCHA_TTL = 120;

/**
 * 邮箱验证码缓存过期时间（秒）
 * @description 邮箱验证码在Redis中的存活时间，超过此时间后验证码自动失效
 * @example 用户收到验证码邮件后，需要在5分钟内完成验证，否则验证码失效
 * @default 300秒（5分钟）
 */
export const EMAIL_CODE_TTL = 300;

export let emailCache: NodeCacheService;
export let svgCache: NodeCacheService;

export const initCacheInstances = (cacheService: CacheService) => {
  emailCache = new NodeCacheService(cacheService);
  svgCache = new NodeCacheService(cacheService);
};
