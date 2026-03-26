import { Module } from '@nestjs/common';
import { SlowQueryMonitorService } from './slow-query-monitor.service';
import { QueryCacheService } from './query-cache.service';
import { ReadWriteSplitService } from './read-write-split.service';
import { DatabaseOptimizationController } from './database-optimization.controller';
import { DatabaseOptimizationInterceptor } from '@/common/interceptors/database-optimization.interceptor';
import { CacheModule } from '@/modules/cache/cache.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [CacheModule, ScheduleModule],
  controllers: [DatabaseOptimizationController],
  providers: [
    SlowQueryMonitorService,
    QueryCacheService,
    ReadWriteSplitService,
    DatabaseOptimizationInterceptor,
  ],
  exports: [
    SlowQueryMonitorService,
    QueryCacheService,
    ReadWriteSplitService,
    DatabaseOptimizationInterceptor,
  ],
})
export class DatabaseOptimizationModule {}
