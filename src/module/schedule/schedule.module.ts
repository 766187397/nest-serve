import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { Schedule } from './entities/schedule.entity';
import { ScheduleLog } from './entities/schedule-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, ScheduleLog]), NestScheduleModule.forRoot()],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
