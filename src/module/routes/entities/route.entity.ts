import { BaseEntity } from "@/common/entities/base";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Tree, TreeChildren, TreeParent } from "typeorm";

@Entity("route", { comment: "路由表" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_route_id_deletedAt", ["id", "deletedAt"])
@Tree("materialized-path")
export class Route extends BaseEntity {
  @Column({ default: "", comment: "路由类型：菜单/按钮/API等" })
  type: string;

  @Column({ default: "", comment: "路由名称（跳转）" })
  name: string;

  @Column({ default: "", comment: "路由显示名称" })
  title: string;

  @Column({ default: "", comment: "前端路由路径（含动态参数）" })
  path: string;

  @Column({ default: "", comment: "Vue组件路径（物理路径）" })
  component: string;

  @Column({ default: "", comment: "其他携带信息json字符串(object对象的形式)" })
  meta: string;

  @Column({ default: "", comment: "图标标识" })
  icon: string;

  @Column({ default: false, comment: "是否为外链" })
  externalLinks: boolean;

  @Column({ default: "", comment: "重定向地址" })
  redirect: string;

  // 树形结构关系
  // @OneToMany(() => Route, (route) => route.parent)
  @TreeChildren()
  children: Route[];

  // @ManyToOne(() => Route, (route) => route.children)
  // @JoinColumn({ name: "parent" })
  @TreeParent()
  parent: Route;
}
