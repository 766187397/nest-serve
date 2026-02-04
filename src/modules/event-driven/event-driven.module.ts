import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service';
import { MessageQueueService } from './message-queue.service';
import { EventProcessor } from './event.processor';
import { EventDrivenController } from './event-driven.controller';
import { EventDrivenConfig } from '@/config/event-driven';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    BullModule.registerQueue({
      name: 'events',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
  ],
  controllers: [EventDrivenController],
  providers: [
    EventBusService,
    MessageQueueService,
    EventProcessor,
  ],
  exports: [
    EventBusService,
    MessageQueueService,
  ],
})
export class EventDrivenModule {}
