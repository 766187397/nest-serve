import { BaseEntity } from "@/common/entities/base";
import { Column, Entity, Index } from "typeorm";
import { Exclude } from "class-transformer";

@Entity("users", { comment: "用户信息表" })
// 复合索引 优化同时查询id和isDeleted的情况
@Index("IDX_users_id_isDeleted", ["id", "deletedAt"])
export class User extends BaseEntity {
  @Column({ type: "varchar", name: "user_name", length: 30, nullable: false, comment: "用户账号" })
  userName: string;

  @Column({ type: "varchar", name: "nick_name", length: 30, nullable: false, comment: "用户昵称" })
  nickName: string;

  @Exclude({ toPlainOnly: true }) // 输出屏蔽密码
  @Column({ type: "varchar", name: "password", length: 200, nullable: false, default: "", comment: "用户登录密码" })
  password: string;

  @Column({ type: "varchar", name: "email", length: 50, default: "", comment: "邮箱" })
  email: string;

  @Column({ type: "varchar", name: "phone_number", default: "", length: 11, comment: "手机号码" })
  phone: string;

  //0男 1女 2未知
  @Column({ type: "varchar", name: "sex", default: "0", length: 1, comment: "性别" })
  sex: string;

  @Column({ type: "varchar", name: "avatar", default: "", comment: "头像地址" })
  avatar: string;
}
