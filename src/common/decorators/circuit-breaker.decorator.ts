import { SetMetadata } from '@nestjs/common';

export const CIRCUIT_BREAKER_KEY = 'circuitBreaker';
export const CIRCUIT_BREAKER_FALLBACK_KEY = 'circuitBreakerFallback';

export interface CircuitBreakerOptions {
  key: string;
  fallback?: string;
}

export const CircuitBreaker = (options: CircuitBreakerOptions) =>
  SetMetadata(CIRCUIT_BREAKER_KEY, options);

export const CircuitBreakerFallback = (methodName: string) =>
  SetMetadata(CIRCUIT_BREAKER_FALLBACK_KEY, methodName);
