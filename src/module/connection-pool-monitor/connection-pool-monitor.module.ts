import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionPoolMonitorController } from './connection-pool-monitor.controller';
import { ConnectionPoolMonitorService } from './connection-pool-monitor.service';

@Module({
  imports: [TypeOrmModule],
  controllers: [ConnectionPoolMonitorController],
  providers: [ConnectionPoolMonitorService],
  exports: [ConnectionPoolMonitorService],
})
export class ConnectionPoolMonitorModule {}
