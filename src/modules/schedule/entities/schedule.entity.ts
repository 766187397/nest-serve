import { UUIDBaseEntity } from '@/common/entities/base';
import { Column, Entity, Index } from 'typeorm';
import { Transform } from 'class-transformer';
import * as dayjs from 'dayjs';

@Entity('schedule', { comment: '定时任务表' })
@Index('IDX_schedule_id_deletedAt', ['id', 'deletedAt'])
export class Schedule extends UUIDBaseEntity {
  @Column({ type: 'varchar', length: 100, comment: '任务名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '任务描述' })
  description: string;

  @Column({ type: 'varchar', length: 100, comment: 'Cron表达式' })
  cronExpression: string;

  @Column({ type: 'varchar', length: 100, comment: '内部任务标识' })
  jobName: string;

  @Column({ type: 'timestamp', nullable: true, comment: '上次执行时间' })
  @Transform(({ value }) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'))
  lastExecutionTime: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '下次执行时间' })
  @Transform(({ value }) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'))
  nextExecutionTime: Date;

  @Column({ type: 'int', default: 300, comment: '任务执行超时时间（秒）' })
  timeout: number;

  @Column({ type: 'int', default: 0, comment: '失败重试次数' })
  retryCount: number;

  @Column({ type: 'int', default: 60, comment: '重试间隔（秒）' })
  retryInterval: number;
}
