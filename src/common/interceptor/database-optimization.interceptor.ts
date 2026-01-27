import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SlowQueryMonitorService } from '@/module/database-optimization/slow-query-monitor.service';
import { QueryCacheService } from '@/module/database-optimization/query-cache.service';
import { ReadWriteSplitService } from '@/module/database-optimization/read-write-split.service';
import { Repository, ObjectLiteral } from 'typeorm';

@Injectable()
export class DatabaseOptimizationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DatabaseOptimizationInterceptor.name);

  constructor(
    private readonly slowQueryMonitorService: SlowQueryMonitorService,
    private readonly queryCacheService: QueryCacheService,
    private readonly readWriteSplitService: ReadWriteSplitService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.debug(`Request completed in ${duration}ms`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`Request failed in ${duration}ms: ${error.message}`);
        },
      }),
    );
  }
}

export class QueryOptimizationInterceptor {
  private readonly logger = new Logger(QueryOptimizationInterceptor.name);

  constructor(
    private readonly slowQueryMonitorService: SlowQueryMonitorService,
    private readonly queryCacheService: QueryCacheService,
  ) {}

  async executeQuery<T>(
    query: string,
    executor: () => Promise<T>,
    options?: {
      cache?: boolean;
      ttl?: number;
      parameters?: any[];
      entityType?: string;
    }
  ): Promise<T> {
    const startTime = Date.now();

    try {
      if (options?.cache) {
        const cached = await this.queryCacheService.get<T>(query, options.parameters);
        if (cached !== null) {
          return cached;
        }
      }

      const result = await executor();
      const duration = Date.now() - startTime;

      if (options?.cache) {
        await this.queryCacheService.set(query, result, options.ttl, options.parameters);
      }

      if (duration > 1000) {
        this.slowQueryMonitorService.recordSlowQuery(
          query,
          duration,
          options?.parameters,
          undefined,
          options?.entityType
        );
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Query failed in ${duration}ms: ${error.message}`);
      throw error;
    }
  }

  async executeRepositoryQuery<T extends ObjectLiteral>(
    repository: Repository<T>,
    operation: string,
    executor: () => Promise<T>,
    options?: {
      cache?: boolean;
      ttl?: number;
      parameters?: any[];
    }
  ): Promise<T> {
    const query = `${repository.metadata.name}.${operation}`;
    return this.executeQuery(query, executor, {
      ...options,
      entityType: repository.metadata.name,
    });
  }
}
