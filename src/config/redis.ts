import { ConfigService } from '@nestjs/config';

export interface RedisConfig {
  enabled: boolean;
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  fallbackEnabled: boolean;
}

export const getRedisConfig = (configService: ConfigService): RedisConfig => {
  return {
    enabled: configService.get<string>('REDIS_ENABLED') === 'true',
    host: configService.get<string>('REDIS_HOST') || '127.0.0.1',
    port: configService.get<number>('REDIS_PORT') || 6379,
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
    db: configService.get<number>('REDIS_DB') || 0,
    keyPrefix: configService.get<string>('REDIS_KEY_PREFIX') || 'nest-serve:',
    fallbackEnabled: configService.get<string>('REDIS_FALLBACK_ENABLED') !== 'false',
  };
};
