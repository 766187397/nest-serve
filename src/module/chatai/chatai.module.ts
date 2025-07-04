import { Module } from '@nestjs/common';
import { ChataiService } from './chatai.service';
import { ChataiController } from './chatai.controller';

@Module({
  controllers: [ChataiController],
  providers: [ChataiService],
})
export class ChataiModule {}
