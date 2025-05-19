import { BaseEntity } from "@/common/entities/base";
import { Column, Entity, Index } from "typeorm";

@Entity("notice", { comment: "通知表" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_notice_id_deletedAt", ["id", "deletedAt"])
export class Notice extends BaseEntity {
  @Column({ type: "varchar", length: 30, comment: "通知类型" })
  type: string;
  @Column({ type: "varchar", length: 255, comment: "指定角色权限" })
  roleKey?: string[];
  @Column({ type: "varchar", length: 50, comment: "标题" })
  title: string;
  @Column({ type: "text", comment: "内容" })
  content?: string;
  @Column({ type: "date", comment: "指定时间" })
  specifyTime?: Date;
}
