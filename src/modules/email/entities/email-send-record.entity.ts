import { AutoIDBaseEntity } from '@/common/entities/base';
import { Column, Entity, Index } from 'typeorm';

@Entity('email_send_record', { comment: '邮箱发送记录' })
// 复合索引 优化同时查询id和deletedAt的情况
@Index('IDX_email_send_record_id_deletedAt', ['id', 'deletedAt'])
export class EmailSendRecord extends AutoIDBaseEntity {
  @Column({ type: 'varchar', nullable: false, comment: '发送的邮箱地址' })
  email: string;

  @Column({ type: 'varchar', nullable: false, comment: '邮件主题' })
  subject: string;

  @Column({ type: 'text', nullable: true, comment: '邮件内容' })
  content: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    comment: '发送状态：true成功，false失败',
  })
  sendStatus: boolean;

  @Column({ type: 'text', nullable: true, comment: '错误信息（如果发送失败）' })
  errorMessage: string;

  @Column({ type: 'varchar', nullable: true, comment: '发送者' })
  sender: string;

  @Column({ type: 'varchar', nullable: true, comment: '邮件模板ID' })
  templateId: string;
}
