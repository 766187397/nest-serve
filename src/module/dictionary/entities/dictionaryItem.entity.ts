import { BaseEntity } from "@/common/entities/base";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Dictionary } from "./dictionary.entity";

@Entity("dictionary_item", { comment: "字典项列表" })
// 复合索引 优化同时查询id和deletedAt的情况
@Index("IDX_dictionary_item_id_deletedAt", ["id", "deletedAt"])
export class DictionaryItem extends BaseEntity {
  @ManyToOne(() => Dictionary)
  @JoinColumn({ name: "category_type" })
  category: Dictionary;

  @Column()
  label: string;

  @Column()
  value: string;

  @Column({ nullable: true })
  description?: string;
}
