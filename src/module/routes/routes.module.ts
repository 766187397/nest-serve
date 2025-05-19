import { Module } from "@nestjs/common";
import { RoutesService } from "./routes.service";
import { RoutesController } from "./routes.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Route } from "./entities/route.entity";
import { Role } from "@/module/roles/entities/role.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Route, Role])],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
