import { Module } from "@nestjs/common";
import { User } from "@/module/users/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { defaultData } from "./defaultData.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [defaultData],
})
export class DefaultDataModule {}
