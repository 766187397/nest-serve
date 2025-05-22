import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Exclude, Transform } from "class-transformer";
import * as dayjs from "dayjs";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ comment: "ID" })
  id: number;

  @Column({ default: 1, comment: "排序" })
  sort: number;

  @Column({ default: 1, comment: "状态；1 - 启用，2 - 禁用；根据业务定义" })
  status: number;

  @Exclude({ toPlainOnly: true })
  @Column({ default: "admin", comment: "平台标识（如admin/web/app/mini），具体更加数据来定义，如果app和mini的数据就是前台的就和前台使用一样的字段不要修改即可" })
  platform: string;

  @CreateDateColumn({ comment: "创建时间" })
  @Transform(({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm:ss"))
  createdAt: Date;

  @UpdateDateColumn({ comment: "更新时间" })
  @Transform(({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm:ss"))
  updatedAt: Date;

  @DeleteDateColumn({ comment: "删除时间" })
  @Exclude({ toPlainOnly: true })
  // @Transform(({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm:ss"))
  deletedAt: Date;
}
