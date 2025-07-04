import { UUIDBaseEntity } from "@/common/entities/base";
import { Column, Entity, Index } from "typeorm";

@Entity("notice", { comment: "通知表" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_notice_id_deletedAt", ["id", "deletedAt"])
export class Notice extends UUIDBaseEntity {
  @Column({ type: "varchar", length: 30, comment: "通知类型", default: "" })
  type: string;

  @Column({ type: "varchar", comment: "指定角色权限", default: "" })
  roleKeys?: string;

  @Column({ type: "text", comment: "用户id", nullable: true })
  userIds?: string;

  @Column({ type: "varchar", length: 50, comment: "标题", default: "" })
  title: string;
  /** text 需要设置可以为空，不能有默认值""等 */
  @Column({ type: "text", comment: "内容", nullable: true })
  content?: string;

  @Column({ type: "date", comment: "指定时间", nullable: true })
  specifyTime?: Date;
}
