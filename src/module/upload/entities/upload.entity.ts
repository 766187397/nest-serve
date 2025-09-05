import { UUIDBaseEntity } from "src/common/entities/base";
import { Column, Entity, Index } from "typeorm";

@Entity("uploads", { comment: "文件信息表" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_uploads_id_deletedAt", ["id", "deletedAt"])
export class Upload extends UUIDBaseEntity {
  @Column({ type: "varchar", length: 255, comment: "文件名" })
  fileName: string;

  @Column({ type: "varchar", length: 255, comment: "文件路径" })
  url: string;

  @Column({ type: "varchar", length: 255, comment: "文件大小" })
  size: string;

  @Column({ type: "varchar", length: 255, comment: "文件类型" })
  mimetype: string;

  @Column({ type: "varchar", length: 255, comment: "大文件hash值", nullable: true })
  hash: string;
}
