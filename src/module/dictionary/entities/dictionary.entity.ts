import { BaseEntity } from "@/common/entities/base";
import { Column, Entity, Index, OneToMany } from "typeorm";
import { DictionaryItem } from "./dictionaryItem.entity";

@Entity("dictionary", { comment: "字典分类表" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_dictionary_id_deletedAt", ["id", "deletedAt"])
export class Dictionary extends BaseEntity {
  @Column({ unique: true, comment: "字典分类类型" })
  type: string;

  @Column({ comment: "字典名称" })
  name: string;

  @Column({ nullable: true, comment: "字典描述" })
  description?: string;

  @OneToMany(() => DictionaryItem, (item) => item.category)
  items: DictionaryItem[];
}
