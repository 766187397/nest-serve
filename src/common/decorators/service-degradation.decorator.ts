import { SetMetadata } from '@nestjs/common';

export const SERVICE_DEGRADATION_KEY = 'serviceDegradation';

export interface ServiceDegradationOptions {
  serviceName: string;
  fallback?: string;
}

export const ServiceDegradation = (options: ServiceDegradationOptions) =>
  SetMetadata(SERVICE_DEGRADATION_KEY, options);
