import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { defaultData } from "./defaultData.service";
import { User } from "@/module/users/entities/user.entity";
import { Role } from "@/module/roles/entities/role.entity";
import { Route } from "@/module/routes/entities/route.entity";
import { Dictionary } from "@/module/dictionary/entities/dictionary.entity";
import { DictionaryItem } from "@/module/dictionary/entities/dictionaryItem.entity";
import { Email } from "@/module/email/entities/email.entity";
import { Notice } from "@/module/notice/entities/notice.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Route, Dictionary, DictionaryItem, Email, Notice])],
  controllers: [],
  providers: [defaultData],
})
export class DefaultDataModule {}
