import { UUIDBaseEntity } from "@/common/entities/base";
import { Column, Entity, Index } from "typeorm";

@Entity("log", { comment: "日志" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_log_id_deletedAt", ["id", "deletedAt"])
export class Log extends UUIDBaseEntity {
  @Column({ type: "varchar", length: 30, comment: "用户账号" })
  account: string;

  @Column({ type: "varchar", length: 30, comment: "用户昵称" })
  nickName: string;

  @Column({ type: "varchar", comment: "url" })
  url: string;

  @Column({ type: "varchar", comment: "请求方式" })
  method: string;

  @Column({ type: "varchar", comment: "请求来源" })
  referer: string;

  @Column({ type: "varchar", comment: "接口平台" })
  apiPlatform: string;

  @Column({ type: "varchar", comment: "浏览器" })
  browser: string;

  @Column({ type: "varchar", comment: "响应时间" })
  responseTime: number;

  @Column({ type: "text", nullable: false, comment: "响应内容" })
  resData: string;

  @Column({ type: "varchar", comment: "状态码" })
  statusCode: string;

  @Column({ type: "varchar", comment: "IP" })
  IP: string;
}
