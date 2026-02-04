import { ApiResultWrapperDto } from '@/common/dto/base';

export class EventDto {
  id: string;
  eventName: string;
  payload: Record<string, any>;
  correlationId?: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export class EventHistoryResponseDto extends ApiResultWrapperDto<EventDto[]> {
}

export class EventStatisticsResponseDto extends ApiResultWrapperDto<{
  totalEvents: number;
  pendingEvents: number;
  processingEvents: number;
  completedEvents: number;
  failedEvents: number;
  averageProcessingTime: number;
  eventsByType: Record<string, number>;
}> {
}

export class EventStatusResponseDto extends ApiResultWrapperDto<{
  enabled: boolean;
  totalListeners: number;
  activeListeners: number;
  eventQueueSize: number;
  processingEvents: number;
}> {
}
