import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as NodeCache from 'node-cache';
import { getRedisConfig, RedisConfig } from '@/config/redis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis | null = null;
  private fallbackCache: NodeCache;
  private config: RedisConfig;
  private isRedisAvailable: boolean = false;

  constructor(private readonly configService: ConfigService) {
    this.config = getRedisConfig(configService);
    this.fallbackCache = new NodeCache({
      stdTTL: 600,
      checkperiod: 120,
    });
  }

  async onModuleInit() {
    if (this.config.enabled) {
      await this.connectRedis();
    } else {
      this.logger.warn('Redis is disabled, using fallback cache (NodeCache)');
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  private async connectRedis() {
    try {
      this.redis = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.error(
              'Redis connection failed after 3 retries, switching to fallback cache'
            );
            this.isRedisAvailable = false;
            return null;
          }
          const delay = Math.min(times * 100, 3000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
        this.isRedisAvailable = true;
      });

      this.redis.on('error', (error) => {
        this.logger.error(`Redis connection error: ${error.message}`);
        this.isRedisAvailable = false;
      });

      this.redis.on('close', () => {
        this.logger.warn('Redis connection closed');
        this.isRedisAvailable = false;
      });

      await this.redis.ping();
      this.isRedisAvailable = true;
    } catch (error) {
      this.logger.error(`Failed to connect to Redis: ${error.message}`);
      this.isRedisAvailable = false;
      if (this.config.fallbackEnabled) {
        this.logger.warn('Fallback cache (NodeCache) is enabled');
      }
    }
  }

  private getKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getKey(key);

    if (this.isRedisAvailable && this.redis) {
      try {
        const value = await this.redis.get(fullKey);
        if (value !== null) {
          return JSON.parse(value) as T;
        }
      } catch (error) {
        this.logger.error(`Redis get error for key ${key}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    if (this.config.fallbackEnabled) {
      const value = this.fallbackCache.get<T>(fullKey);
      if (value !== undefined) {
        return value;
      }
    }

    return null;
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const fullKey = this.getKey(key);
    const serializedValue = JSON.stringify(value);

    if (this.isRedisAvailable && this.redis) {
      try {
        if (ttl) {
          await this.redis.setex(fullKey, ttl, serializedValue);
        } else {
          await this.redis.set(fullKey, serializedValue);
        }
        return true;
      } catch (error) {
        this.logger.error(`Redis set error for key ${key}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    if (this.config.fallbackEnabled) {
      this.fallbackCache.set(fullKey, value, ttl || 0);
      return true;
    }

    return false;
  }

  async del(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);

    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.del(fullKey);
      } catch (error) {
        this.logger.error(`Redis del error for key ${key}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    if (this.config.fallbackEnabled) {
      this.fallbackCache.del(fullKey);
    }

    return true;
  }

  async delPattern(pattern: string): Promise<number> {
    const fullPattern = this.getKey(pattern);
    let deletedCount = 0;

    if (this.isRedisAvailable && this.redis) {
      try {
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          deletedCount = await this.redis.del(...keys);
        }
      } catch (error) {
        this.logger.error(`Redis delPattern error for pattern ${pattern}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    if (this.config.fallbackEnabled) {
      const allKeys = this.fallbackCache.keys();
      const matchingKeys = allKeys.filter((key) => key.startsWith(fullPattern.replace('*', '')));
      if (matchingKeys.length > 0) {
        this.fallbackCache.del(matchingKeys);
        deletedCount += matchingKeys.length;
      }
    }

    return deletedCount;
  }

  async exists(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);

    if (this.isRedisAvailable && this.redis) {
      try {
        const result = await this.redis.exists(fullKey);
        return result === 1;
      } catch (error) {
        this.logger.error(`Redis exists error for key ${key}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    if (this.config.fallbackEnabled) {
      return this.fallbackCache.has(fullKey);
    }

    return false;
  }

  async flushAll(): Promise<boolean> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const keys = await this.redis.keys(`${this.config.keyPrefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (error) {
        this.logger.error(`Redis flushAll error: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    if (this.config.fallbackEnabled) {
      this.fallbackCache.flushAll();
    }

    return true;
  }

  async getTTL(key: string): Promise<number> {
    const fullKey = this.getKey(key);

    if (this.isRedisAvailable && this.redis) {
      try {
        const ttl = await this.redis.ttl(fullKey);
        return ttl;
      } catch (error) {
        this.logger.error(`Redis getTTL error for key ${key}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    if (this.config.fallbackEnabled) {
      const ttl = this.fallbackCache.getTtl(fullKey);
      if (ttl && ttl > 0) {
        return Math.floor((ttl - Date.now()) / 1000);
      }
      return -2;
    }

    return -2;
  }

  async setTTL(key: string, ttl: number): Promise<boolean> {
    const fullKey = this.getKey(key);

    if (this.isRedisAvailable && this.redis) {
      try {
        const result = await this.redis.expire(fullKey, ttl);
        return result === 1;
      } catch (error) {
        this.logger.error(`Redis setTTL error for key ${key}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    if (this.config.fallbackEnabled) {
      const value = this.fallbackCache.get(fullKey);
      if (value !== undefined) {
        this.fallbackCache.set(fullKey, value, ttl);
        return true;
      }
    }

    return false;
  }

  async incr(key: string): Promise<number> {
    const fullKey = this.getKey(key);

    if (this.isRedisAvailable && this.redis) {
      try {
        return await this.redis.incr(fullKey);
      } catch (error) {
        this.logger.error(`Redis incr error for key ${key}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    if (this.config.fallbackEnabled) {
      const value = this.fallbackCache.get<number>(fullKey) || 0;
      const newValue = value + 1;
      this.fallbackCache.set(fullKey, newValue);
      return newValue;
    }

    return 0;
  }

  async decr(key: string): Promise<number> {
    const fullKey = this.getKey(key);

    if (this.isRedisAvailable && this.redis) {
      try {
        return await this.redis.decr(fullKey);
      } catch (error) {
        this.logger.error(`Redis decr error for key ${key}: ${error.message}`);
        this.isRedisAvailable = false;
      }
    }

    if (this.config.fallbackEnabled) {
      const value = this.fallbackCache.get<number>(fullKey) || 0;
      const newValue = value - 1;
      this.fallbackCache.set(fullKey, newValue);
      return newValue;
    }

    return 0;
  }

  getStatus(): { redisAvailable: boolean; fallbackEnabled: boolean } {
    return {
      redisAvailable: this.isRedisAvailable,
      fallbackEnabled: this.config.fallbackEnabled,
    };
  }
}
