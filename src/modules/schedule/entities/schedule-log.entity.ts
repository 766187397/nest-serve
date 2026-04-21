import { UUIDBaseEntity } from '@/common/entities/base';
import { Column, Entity, Index } from 'typeorm';
import { Transform } from 'class-transformer';
import * as dayjs from 'dayjs';

@Entity('schedule_log', { comment: '定时任务执行日志表' })
@Index('IDX_schedule_log_id_deletedAt', ['id', 'deletedAt'])
export class ScheduleLog extends UUIDBaseEntity {
  @Column({ type: 'varchar', length: 36, comment: '关联的任务ID' })
  scheduleId: string;

  @Column({ comment: '执行时间' })
  @Transform(({ value }) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'))
  executionTime: Date;

  @Column({ type: 'varchar', length: 20, comment: '执行状态（success/failed）' })
  executionStatus: string;

  @Column({ type: 'bigint', comment: '执行耗时（毫秒）' })
  duration: number;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errorMessage: string;
}
