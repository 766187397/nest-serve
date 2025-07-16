import { UUIDBaseEntity } from "@/common/entities/base";
import { User } from "@/module/users/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity("chatai", { comment: "AI 对话记录表" })
export class Chatai extends UUIDBaseEntity {
  @Column({ type: "varchar", comment: "类型", nullable: true })
  type: string;

  @Column({ type: "text", comment: "AI 对话记录", nullable: true })
  content: string;

  @ManyToOne(() => User, (user) => user)
  user: User;
}
