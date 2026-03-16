import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request } from 'express';
import { CacheService } from '@/common/service/cache.service';
import { getConcurrencyControlConfig, RateLimitConfig } from '@/config/concurrency-control';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RateLimitInterceptor.name);
  private readonly config: RateLimitConfig;
  private readonly buckets: Map<string, TokenBucket> = new Map();

  constructor(private readonly cacheService: CacheService) {
    this.config = getConcurrencyControlConfig(new (require('@nestjs/config').ConfigService)()).rateLimit;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.config.enabled) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.getRequestKey(request);

    return next.handle().pipe(
      tap(() => {
        if (!this.config.skipSuccessfulRequests) {
          this.recordRequest(key, true);
        }
      }),
      catchError((error) => {
        if (!this.config.skipFailedRequests) {
          this.recordRequest(key, false);
        }
        return throwError(() => error);
      })
    );
  }

  private getRequestKey(request: Request): string {
    const ip = this.getClientIp(request);
    const path = request.route?.path || request.path;
    return `rate-limit:${ip}:${path}`;
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  private async recordRequest(key: string, success: boolean): Promise<void> {
    try {
      const now = Date.now();
      let bucket: TokenBucket | null = this.buckets.get(key) || null;

      if (!bucket) {
        bucket = await this.loadBucketFromCache(key);
      }

      if (!bucket) {
        bucket = {
          tokens: this.config.limit,
          lastRefill: now,
        };
      }

      bucket = this.refillBucket(bucket, now);

      if (bucket.tokens > 0) {
        bucket.tokens--;
        this.buckets.set(key, bucket);
        await this.saveBucketToCache(key, bucket);
      } else {
        this.logger.warn(`Rate limit exceeded for key: ${key}`);
        throw new Error('Too Many Requests');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Too Many Requests') {
        throw error;
      }
      this.logger.error(`Error recording request: ${error.message}`);
    }
  }

  private refillBucket(bucket: TokenBucket, now: number): TokenBucket {
    const timePassed = now - bucket.lastRefill;
    const refillAmount = Math.floor((timePassed / (this.config.ttl * 1000)) * this.config.limit);

    if (refillAmount > 0) {
      bucket.tokens = Math.min(this.config.limit, bucket.tokens + refillAmount);
      bucket.lastRefill = now;
    }

    return bucket;
  }

  private async loadBucketFromCache(key: string): Promise<TokenBucket | null> {
    try {
      const cached = await this.cacheService.get<TokenBucket>(key);
      return cached;
    } catch (error) {
      return null;
    }
  }

  private async saveBucketToCache(key: string, bucket: TokenBucket): Promise<void> {
    try {
      await this.cacheService.set(key, bucket, this.config.ttl);
    } catch (error) {
      this.logger.error(`Error saving bucket to cache: ${error.message}`);
    }
  }
}
