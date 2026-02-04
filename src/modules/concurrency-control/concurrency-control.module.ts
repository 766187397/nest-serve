import { Module } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { ServiceDegradationService } from './service-degradation.service';
import { DistributedLockService } from './distributed-lock.service';
import { CacheModule } from '@/common/module/cache.module';
import { ConcurrencyControlController } from './concurrency-control.controller';
import { RateLimitInterceptor } from '@/common/interceptor/rate-limit.interceptor';
import { ConcurrencyControlInterceptor } from '@/common/interceptor/concurrency-control.interceptor';

@Module({
  imports: [CacheModule],
  controllers: [ConcurrencyControlController],
  providers: [
    CircuitBreakerService,
    ServiceDegradationService,
    DistributedLockService,
    RateLimitInterceptor,
    ConcurrencyControlInterceptor,
  ],
  exports: [
    CircuitBreakerService,
    ServiceDegradationService,
    DistributedLockService,
    RateLimitInterceptor,
    ConcurrencyControlInterceptor,
  ],
})
export class ConcurrencyControlModule {}
