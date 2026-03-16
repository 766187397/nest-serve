import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { defaultData } from './defaultData.service';
import { User } from '@/modules/users/entities/user.entity';
import { Role } from '@/modules/roles/entities/role.entity';
import { Route } from '@/modules/routes/entities/route.entity';
import { Dictionary } from '@/modules/dictionary/entities/dictionary.entity';
import { DictionaryItem } from '@/modules/dictionary/entities/dictionaryItem.entity';
import { Email } from '@/modules/email/entities/email.entity';
import { Notice } from '@/modules/notice/entities/notice.entity';
import { Schedule } from '@/modules/schedule/entities/schedule.entity';
import { ScheduleLog } from '@/modules/schedule/entities/schedule-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Route, Dictionary, DictionaryItem, Email, Notice, Schedule, ScheduleLog]),
  ],
  controllers: [],
  providers: [defaultData],
})
export class DefaultDataModule {}
