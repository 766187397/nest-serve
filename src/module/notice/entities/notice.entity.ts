import { BaseEntity } from "@/common/entities/base";
import { Column, Entity, Index } from "typeorm";

@Entity("notice", { comment: "通知表" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_notice_id_deletedAt", ["id", "deletedAt"])
export class Notice extends BaseEntity {
  @Column({ type: "varchar", length: 30, comment: "通知类型", default: "" })
  type: string;

  @Column({ type: "varchar", comment: "指定角色权限", default: "" })
  roleKeys?: string;

  @Column({ type: "text", comment: "用户id", default: "" })
  userIds?: string;

  @Column({ type: "varchar", length: 50, comment: "标题", default: "" })
  title: string;

  @Column({ type: "text", comment: "内容", default: "" })
  content?: string;

  @Column({ type: "date", comment: "指定时间", nullable: true })
  specifyTime?: Date;
}
