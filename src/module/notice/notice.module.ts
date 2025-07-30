import { forwardRef, Module } from "@nestjs/common";
import { NoticeService } from "./notice.service";
import { NoticeController } from "./notice.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notice } from "./entities/notice.entity";
import { NoticeWS } from "./notice.ws";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Notice]), forwardRef(() => AuthModule)],
  controllers: [NoticeController],
  providers: [NoticeService, NoticeWS],
})
export class NoticeModule {}
