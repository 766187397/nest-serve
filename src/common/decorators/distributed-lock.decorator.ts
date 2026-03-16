import { SetMetadata } from '@nestjs/common';

export const DISTRIBUTED_LOCK_KEY = 'distributedLock';

export interface DistributedLockOptions {
  key: string;
  timeout?: number;
  retryDelay?: number;
  retryCount?: number;
}

export const DistributedLock = (options: DistributedLockOptions) =>
  SetMetadata(DISTRIBUTED_LOCK_KEY, options);
