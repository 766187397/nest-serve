import { ApiResultWrapperDto } from '@/common/dto/base';

/** 事件DTO */
export class EventDto {
  id: string;
  eventName: string;
  payload: Record<string, any>;
  correlationId?: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

/** 事件历史响应DTO */
export class EventHistoryResponseDto extends ApiResultWrapperDto<EventDto[]> {
}

/** 事件统计响应DTO */
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

/** 事件状态响应DTO */
export class EventStatusResponseDto extends ApiResultWrapperDto<{
  enabled: boolean;
  totalListeners: number;
  activeListeners: number;
  eventQueueSize: number;
  processingEvents: number;
}> {
}
