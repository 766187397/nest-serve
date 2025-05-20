import { Module } from "@nestjs/common";
import { DictionaryService } from "./dictionary.service";
import { DictionaryController, DictionaryItemController } from "./dictionary.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Dictionary } from "./entities/dictionary.entity";
import { DictionaryItem } from "./entities/dictionaryItem.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Dictionary, DictionaryItem])],
  controllers: [DictionaryController, DictionaryItemController],
  providers: [DictionaryService],
})
export class DictionaryModule {}
