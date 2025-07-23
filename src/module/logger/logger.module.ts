import { Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { LoggerController } from "./logger.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Log } from "./entities/logger.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Log], "logger")],
  controllers: [LoggerController],
  providers: [LoggerService],
})
export class LoggerModule {}
