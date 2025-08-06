import { Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { LoggerController } from "./logger.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Log } from "./entities/logger.entity";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [TypeOrmModule.forFeature([Log], "logger"), ScheduleModule.forRoot()],
  controllers: [LoggerController],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
