import { BaseEntity } from "@/common/entities/base";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity("route", { comment: "路由表" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_route_id_deletedAt", ["id", "deletedAt"])
export class Route extends BaseEntity {
  @Column({ default: "", comment: "路由类型：菜单/按钮/API等" })
  type: string;

  @Column({ default: "", comment: "路由显示名称" })
  name: string;

  @Column({ default: "", comment: "权限标识" })
  permissions: string;

  @Column({ default: "", comment: "前端路由路径（含动态参数）" })
  path: string;

  @Column({ default: "", comment: "Vue组件路径（物理路径）" })
  component: string;

  @Column({ default: "", comment: "携带信息" })
  menu: string;

  @Column({ default: "", comment: "图标标识" })
  icon: string;

  // 树形结构关系
  @OneToMany(() => Route, (route) => route.parentId)
  children: Route[];

  @ManyToOne(() => Route, (route) => route.children)
  @JoinColumn({ name: "parentId" })
  parentId: Route;
}
