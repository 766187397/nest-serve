import { Module } from "@nestjs/common";
import { ChataiService } from "./chatai.service";
import { ChataiController } from "./chatai.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chatai } from "./entities/chatai.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Chatai])],
  controllers: [ChataiController],
  providers: [ChataiService],
})
export class ChataiModule {}
