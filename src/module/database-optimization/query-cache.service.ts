import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheService } from '@/common/service/cache.service';
import { getDatabaseOptimizationConfig, DatabaseOptimizationConfig } from '@/config/database-optimization';
import * as crypto from 'crypto';

export interface QueryCacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hitCount: number;
  query: string;
  parameters?: any[];
}

export interface QueryCacheStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  totalEntries: number;
  memoryUsage: number;
}

@Injectable()
export class QueryCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueryCacheService.name);
  private readonly config: DatabaseOptimizationConfig;
  private readonly cacheService: CacheService;
  private readonly localCache: Map<string, QueryCacheEntry<any>> = new Map();
  private stats = {
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(cacheService: CacheService) {
    this.config = getDatabaseOptimizationConfig(new (require('@nestjs/config').ConfigService)());
    this.cacheService = cacheService;
  }

  onModuleInit() {
    if (this.config.queryCache.enabled) {
      this.logger.log(`Query cache enabled (TTL: ${this.config.queryCache.defaultTTL}s, Max Size: ${this.config.queryCache.maxSize})`);
      
      this.cleanupInterval = setInterval(() => {
        this.cleanupExpiredEntries();
      }, 60000);
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.localCache.clear();
  }

  async get<T>(query: string, parameters?: any[]): Promise<T | null> {
    if (!this.config.queryCache.enabled) {
      return null;
    }

    this.stats.totalQueries++;
    const cacheKey = this.generateCacheKey(query, parameters);

    const entry = this.localCache.get(cacheKey);
    if (entry) {
      if (this.isEntryValid(entry)) {
        entry.hitCount++;
        this.stats.cacheHits++;
        this.logger.debug(`Cache hit for query: ${this.truncateQuery(query)}`);
        return entry.data;
      } else {
        this.localCache.delete(cacheKey);
      }
    }

    const redisData = await this.cacheService.get<QueryCacheEntry<T>>(cacheKey);
    if (redisData && this.isEntryValid(redisData)) {
      redisData.hitCount++;
      this.stats.cacheHits++;
      this.localCache.set(cacheKey, redisData);
      this.logger.debug(`Redis cache hit for query: ${this.truncateQuery(query)}`);
      return redisData.data;
    }

    this.stats.cacheMisses++;
    return null;
  }

  async set<T>(query: string, data: T, ttl?: number, parameters?: any[]): Promise<void> {
    if (!this.config.queryCache.enabled) {
      return;
    }

    const cacheKey = this.generateCacheKey(query, parameters);
    const cacheTTL = ttl || this.config.queryCache.defaultTTL;

    const entry: QueryCacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: cacheTTL,
      hitCount: 0,
      query: this.truncateQuery(query),
      parameters,
    };

    this.localCache.set(cacheKey, entry);
    await this.cacheService.set(cacheKey, entry, cacheTTL);

    this.evictIfNeeded();
    this.logger.debug(`Cached query result: ${this.truncateQuery(query)} (TTL: ${cacheTTL}s)`);
  }

  async invalidate(query: string, parameters?: any[]): Promise<void> {
    const cacheKey = this.generateCacheKey(query, parameters);
    this.localCache.delete(cacheKey);
    await this.cacheService.del(cacheKey);
    this.logger.debug(`Invalidated cache for query: ${this.truncateQuery(query)}`);
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    const keys = Array.from(this.localCache.keys()).filter((key) => key.includes(pattern));
    for (const key of keys) {
      this.localCache.delete(key);
    }
    await this.cacheService.delPattern(pattern);
    this.logger.debug(`Invalidated ${keys.length} cache entries matching pattern: ${pattern}`);
  }

  async invalidateAll(): Promise<void> {
    this.localCache.clear();
    await this.cacheService.flushAll();
    this.logger.log('All query cache invalidated');
  }

  getStats(): QueryCacheStats {
    const hitRate = this.stats.totalQueries > 0 
      ? (this.stats.cacheHits / this.stats.totalQueries) * 100 
      : 0;

    return {
      totalQueries: this.stats.totalQueries,
      cacheHits: this.stats.cacheHits,
      cacheMisses: this.stats.cacheMisses,
      hitRate,
      totalEntries: this.localCache.size,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  resetStats(): void {
    this.stats = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
    this.logger.log('Query cache stats reset');
  }

  getCacheEntries(limit?: number): QueryCacheEntry<any>[] {
    const entries = Array.from(this.localCache.values())
      .sort((a, b) => b.hitCount - a.hitCount);
    return limit ? entries.slice(0, limit) : entries;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredEntries(): Promise<void> {
    const initialSize = this.localCache.size;
    const now = Date.now();

    for (const [key, entry] of this.localCache.entries()) {
      if (!this.isEntryValid(entry)) {
        this.localCache.delete(key);
      }
    }

    const cleanedUp = initialSize - this.localCache.size;
    if (cleanedUp > 0) {
      this.logger.debug(`Cleaned up ${cleanedUp} expired cache entries`);
    }
  }

  private generateCacheKey(query: string, parameters?: any[]): string {
    const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, ' ');
    const paramsKey = parameters ? JSON.stringify(parameters) : '';
    const combined = `${normalizedQuery}:${paramsKey}`;
    const hash = crypto.createHash('md5').update(combined).digest('hex');
    return `${this.config.queryCache.keyPrefix}${hash}`;
  }

  private isEntryValid(entry: QueryCacheEntry<any>): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age < entry.ttl * 1000;
  }

  private truncateQuery(query: string, maxLength: number = 100): string {
    return query.length > maxLength ? `${query.substring(0, maxLength)}...` : query;
  }

  private evictIfNeeded(): void {
    if (this.localCache.size > this.config.queryCache.maxSize) {
      const entries = Array.from(this.localCache.entries())
        .sort((a, b) => a[1].hitCount - b[1].hitCount);

      const toEvict = entries.slice(0, Math.floor(this.config.queryCache.maxSize * 0.1));
      for (const [key] of toEvict) {
        this.localCache.delete(key);
      }

      this.logger.debug(`Evicted ${toEvict.length} least used cache entries`);
    }
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const entry of this.localCache.values()) {
      totalSize += JSON.stringify(entry).length * 2;
    }
    return totalSize;
  }
}
