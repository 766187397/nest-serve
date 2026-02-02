import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { Schedule } from './entities/schedule.entity';
import { ScheduleLog } from './entities/schedule-log.entity';
import { Log } from '@/module/logger/entities/logger.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, ScheduleLog]),
    TypeOrmModule.forFeature([Log], 'logger'),
    NestScheduleModule.forRoot()
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
