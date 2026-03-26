import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { CircuitBreakerService } from '@/modules/concurrency-control/circuit-breaker.service';
import { ServiceDegradationService } from '@/modules/concurrency-control/service-degradation.service';
import { DistributedLockService } from '@/modules/concurrency-control/distributed-lock.service';
import { CIRCUIT_BREAKER_KEY, CIRCUIT_BREAKER_FALLBACK_KEY } from '../decorators/circuit-breaker.decorator';
import { SERVICE_DEGRADATION_KEY } from '../decorators/service-degradation.decorator';
import { DISTRIBUTED_LOCK_KEY } from '../decorators/distributed-lock.decorator';

@Injectable()
export class ConcurrencyControlInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ConcurrencyControlInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly serviceDegradationService: ServiceDegradationService,
    private readonly distributedLockService: DistributedLockService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handler = context.getHandler();
    const circuitBreakerOptions = this.reflector.get(CIRCUIT_BREAKER_KEY, handler);
    const serviceDegradationOptions = this.reflector.get(SERVICE_DEGRADATION_KEY, handler);
    const distributedLockOptions = this.reflector.get(DISTRIBUTED_LOCK_KEY, handler);

    if (!circuitBreakerOptions && !serviceDegradationOptions && !distributedLockOptions) {
      return next.handle();
    }

    const circuitBreakerKey = circuitBreakerOptions?.key;
    const serviceName = serviceDegradationOptions?.serviceName;
    const lockKey = distributedLockOptions?.key;

    return new Observable((subscriber) => {
      this.executeWithConcurrencyControl(
        circuitBreakerKey,
        serviceName,
        lockKey,
        () => next.handle().toPromise()
      )
        .then((result) => {
          subscriber.next(result);
          subscriber.complete();
        })
        .catch((error) => {
          subscriber.error(error);
        });
    });
  }

  private async executeWithConcurrencyControl<T>(
    circuitBreakerKey: string | undefined,
    serviceName: string | undefined,
    lockKey: string | undefined,
    fn: () => Promise<T>
  ): Promise<T> {
    if (lockKey) {
      return await this.distributedLockService.executeWithLock(lockKey, async () => {
        return await this.executeWithCircuitBreakerAndDegradation(
          circuitBreakerKey,
          serviceName,
          fn
        );
      });
    } else {
      return await this.executeWithCircuitBreakerAndDegradation(
        circuitBreakerKey,
        serviceName,
        fn
      );
    }
  }

  private async executeWithCircuitBreakerAndDegradation<T>(
    circuitBreakerKey: string | undefined,
    serviceName: string | undefined,
    fn: () => Promise<T>
  ): Promise<T> {
    if (circuitBreakerKey && serviceName) {
      return await this.circuitBreakerService.execute(
        circuitBreakerKey,
        async () => {
          return await this.serviceDegradationService.execute(serviceName, fn);
        },
        undefined
      );
    } else if (circuitBreakerKey) {
      return await this.circuitBreakerService.execute(circuitBreakerKey, fn);
    } else if (serviceName) {
      return await this.serviceDegradationService.execute(serviceName, fn);
    } else {
      return await fn();
    }
  }
}
