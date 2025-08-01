import { UUIDBaseEntity } from "src/common/entities/base";
import { Column, Entity, Index } from "typeorm";

@Entity("uploads", { comment: "文件信息表" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_uploads_id_deletedAt", ["id", "deletedAt"])
export class Upload extends UUIDBaseEntity {
  @Column({ type: "varchar", name: "file_name", length: 255, comment: "文件名" })
  fileName: string;
  @Column({ type: "varchar", name: "url", length: 255, comment: "文件路径" })
  url: string;
  @Column({ type: "varchar", name: "size", length: 255, comment: "文件大小" })
  size: string;
  @Column({ type: "varchar", name: "mimetype", length: 255, comment: "文件类型" })
  mimetype: string;
}
