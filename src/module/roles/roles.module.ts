import { Module } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { RolesController } from "./roles.controller";
import { Role } from "./entities/role.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Route } from "@/module/routes/entities/route.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Role]), TypeOrmModule.forFeature([Route])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
