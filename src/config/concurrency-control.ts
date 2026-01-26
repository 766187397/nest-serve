import { ConfigService } from '@nestjs/config';

export interface RateLimitConfig {
  enabled: boolean;
  ttl: number;
  limit: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  timeout: number;
  errorThresholdPercentage: number;
  resetTimeout: number;
  rollingCountTimeout: number;
  rollingCountBuckets: number;
}

export interface ServiceDegradationConfig {
  enabled: boolean;
  fallbackEnabled: boolean;
  fallbackTimeout: number;
  maxConcurrentRequests: number;
}

export interface DistributedLockConfig {
  enabled: boolean;
  retryDelay: number;
  retryCount: number;
  lockTimeout: number;
}

export interface ConcurrencyControlConfig {
  rateLimit: RateLimitConfig;
  circuitBreaker: CircuitBreakerConfig;
  serviceDegradation: ServiceDegradationConfig;
  distributedLock: DistributedLockConfig;
}

export const getConcurrencyControlConfig = (
  configService: ConfigService
): ConcurrencyControlConfig => {
  const nodeEnv = configService.get<string>('NODE_ENV') || 'dev';

  return {
    rateLimit: {
      enabled: configService.get<string>('RATE_LIMIT_ENABLED') !== 'false',
      ttl: configService.get<number>('RATE_LIMIT_TTL') || 60,
      limit: configService.get<number>('RATE_LIMIT_LIMIT') || 100,
      skipSuccessfulRequests:
        configService.get<string>('RATE_LIMIT_SKIP_SUCCESSFUL') === 'true',
      skipFailedRequests: configService.get<string>('RATE_LIMIT_SKIP_FAILED') === 'true',
    },
    circuitBreaker: {
      enabled: configService.get<string>('CIRCUIT_BREAKER_ENABLED') !== 'false',
      timeout: configService.get<number>('CIRCUIT_BREAKER_TIMEOUT') || 10000,
      errorThresholdPercentage:
        configService.get<number>('CIRCUIT_BREAKER_ERROR_THRESHOLD') || 50,
      resetTimeout: configService.get<number>('CIRCUIT_BREAKER_RESET_TIMEOUT') || 30000,
      rollingCountTimeout: configService.get<number>('CIRCUIT_BREAKER_ROLLING_TIMEOUT') || 10000,
      rollingCountBuckets: configService.get<number>('CIRCUIT_BREAKER_ROLLING_BUCKETS') || 10,
    },
    serviceDegradation: {
      enabled: configService.get<string>('SERVICE_DEGRADATION_ENABLED') !== 'false',
      fallbackEnabled: configService.get<string>('SERVICE_FALLBACK_ENABLED') === 'true',
      fallbackTimeout: configService.get<number>('SERVICE_FALLBACK_TIMEOUT') || 5000,
      maxConcurrentRequests: configService.get<number>('SERVICE_MAX_CONCURRENT') || 1000,
    },
    distributedLock: {
      enabled: configService.get<string>('DISTRIBUTED_LOCK_ENABLED') !== 'false',
      retryDelay: configService.get<number>('DISTRIBUTED_LOCK_RETRY_DELAY') || 100,
      retryCount: configService.get<number>('DISTRIBUTED_LOCK_RETRY_COUNT') || 3,
      lockTimeout: configService.get<number>('DISTRIBUTED_LOCK_TIMEOUT') || 30000,
    },
  };
};
