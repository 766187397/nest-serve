import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { defaultData } from "./defaultData.service";
import { User } from "@/module/users/entities/user.entity";
import { Role } from "../roles/entities/role.entity";
import { Route } from "../routes/entities/route.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Route])],
  controllers: [],
  providers: [defaultData],
})
export class DefaultDataModule {}
