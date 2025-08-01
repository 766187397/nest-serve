import { UUIDBaseEntity } from "@/common/entities/base";
import { Column, Entity, Index, JoinTable, ManyToMany } from "typeorm";
import { Route } from "@/module/routes/entities/route.entity";

@Entity("roles", { comment: "角色表" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_roles_id_deletedAt", ["id", "deletedAt"])
export class Role extends UUIDBaseEntity {
  @Column("varchar", { comment: "角色名称", length: 50 })
  name: string;

  @Column("varchar", { comment: "权限字符串", length: 32 })
  roleKey: string;

  @Column("varchar", { comment: "角色描述", length: 255, nullable: true })
  description: string;

  @ManyToMany(() => Route)
  @JoinTable()
  routes: Route[];
}
