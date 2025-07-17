import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  PrimaryColumn,
} from "typeorm";
import { Exclude, Transform } from "class-transformer";
import * as dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

/** 基础实体 */
export abstract class BaseEntity {
  @Column({ default: 1, comment: "排序" })
  sort: number;

  @Column({ default: 1, comment: "状态；1 - 启用，2 - 禁用；根据业务定义" })
  status: number;

  @Exclude({ toPlainOnly: true })
  @Column({ default: "admin", comment: "平台标识（如admin/web/app/mini）" })
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

/** UUID基础实体 */
export abstract class UUIDBaseEntity extends BaseEntity {
  @PrimaryColumn({ type: "varchar", length: 36, comment: "uuid" })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}

/** 自增id基础实体 */
export abstract class AutoIDBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "ID" })
  id: number;
}
