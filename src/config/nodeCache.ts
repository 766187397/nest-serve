import { Injectable } from '@nestjs/common';
import { CacheService } from '@/common/service/cache.service';

@Injectable()
export class NodeCacheService {
  constructor(private readonly cacheService: CacheService) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cacheService.get<T>(key);
    return value || undefined;
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
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

export const cacheTime = 5;

export let emailCache: NodeCacheService;
export let svgCache: NodeCacheService;

export const initCacheInstances = (cacheService: CacheService) => {
  emailCache = new NodeCacheService(cacheService);
  svgCache = new NodeCacheService(cacheService);
};
