import { Entity, Index } from "typeorm";

@Entity("email", { comment: "邮箱模板" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_email_id_deletedAt", ["id", "deletedAt"])
export class Email {}
