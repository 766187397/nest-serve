import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { Role } from "@/module/roles/entities/role.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule), TypeOrmModule.forFeature([Role])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
