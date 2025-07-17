import { AutoIDBaseEntity } from "@/common/entities/base";
import { Column, Entity, Index } from "typeorm";

@Entity("email", { comment: "邮箱模板" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_email_id_deletedAt", ["id", "deletedAt"])
export class Email extends AutoIDBaseEntity {
  @Column({ type: "varchar", nullable: false, comment: "邮箱标题" })
  title: string;

  @Column({ type: "text", nullable: false, comment: "邮箱内容" })
  content: string;
}
