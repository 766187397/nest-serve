import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

export interface EventDrivenConfig {
  enabled: boolean;
  eventHistoryRetentionHours: number;
  maxEventHistorySize: number;
  asyncProcessing: boolean;
  retryAttempts: number;
  retryDelayMs: number;
}

export const getEventDrivenConfig = (configService: ConfigService): EventDrivenConfig => ({
  enabled: configService.get<boolean>('EVENT_DRIVEN_ENABLED', true),
  eventHistoryRetentionHours: configService.get<number>(
    'EVENT_HISTORY_RETENTION_HOURS',
    24
  ),
  maxEventHistorySize: configService.get<number>('MAX_EVENT_HISTORY_SIZE', 10000),
  asyncProcessing: configService.get<boolean>('ASYNC_PROCESSING', true),
  retryAttempts: configService.get<number>('RETRY_ATTEMPTS', 3),
  retryDelayMs: configService.get<number>('RETRY_DELAY_MS', 1000),
});

export const EventDrivenConfig = registerAs('eventDriven', () =>
  getEventDrivenConfig(new (require('@nestjs/config').ConfigService)())
);
