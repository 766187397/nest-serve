import { Module } from '@nestjs/common';
import { ConfigManagementService } from './config-management.service';
import { ConfigManagementController } from './config-management.controller';
import { ConfigurationManagementConfig } from '@/config/configuration-management';

@Module({
  controllers: [ConfigManagementController],
  providers: [ConfigManagementService],
  exports: [ConfigManagementService],
})
export class ConfigManagementModule {}
