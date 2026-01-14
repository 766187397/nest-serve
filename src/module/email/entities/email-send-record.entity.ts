import { AutoIDBaseEntity } from '@/common/entities/base';
import { Column, Entity, Index } from 'typeorm';

@Entity('email_send_record', { comment: '邮箱发送记录' })
// 复合索引 优化同时查询id和deletedAt的情况
@Index('IDX_email_send_record_id