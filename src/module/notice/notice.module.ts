import { Module } from "@nestjs/common";
import { NoticeService } from "./notice.service";
import { NoticeController } from "./notice.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notice } from "./entities/notice.entity";
import { NoticeWS } from "./notice.ws";

@Module({
  imports: [TypeOrmModule.forFeature([Notice])],
  controllers: [NoticeController],
  providers: [NoticeService, NoticeWS],
})
export class NoticeModule {}
