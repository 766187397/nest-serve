import { Controller, Get, Post, Put, Delete, Body, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigManagementService } from './config-management.service';
import { UpdateConfigDto, BatchUpdateConfigDto, RollbackConfigDto, ConfigHistoryQueryDto } from './dto/request.dto';
import { GetConfigResponseDto, GetAllConfigsResponseDto, GetConfigVersionsResponseDto, GetConfigAuditResponseDto, ConfigStatusResponseDto } from './dto/response.dto';

@ApiTags('配置管理')
@Controller('config-management')
export class ConfigManagementController {
  constructor(private readonly configManagementService: ConfigManagementService) {}

  @Get()
  @ApiOperation({ summary: '获取所有配置' })
  @ApiResponse({ status: 200, description: '获取成功', type: GetAllConfigsResponseDto })
  async getAllConfigs() {
    const configs = this.configManagementService.getAllConfigs();

    return {
      code: 200,
      message: '获取成功',
      data: configs,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('audit')
  @ApiOperation({ summary: '获取配置变更审计日志' })
  @ApiResponse({ status: 200, description: '获取成功', type: GetConfigAuditResponseDto })
  async getConfigAudits(@Query() query: ConfigHistoryQueryDto) {
    const limit = query.limit ? parseInt(query.limit) : 100;
    const audits = this.configManagementService.getConfigAudits(query.key, limit);

    return {
      code: 200,
      message: '获取成功',
      data: audits,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('status')
  @ApiOperation({ summary: '获取配置管理状态' })
  @ApiResponse({ status: 200, description: '获取成功', type: ConfigStatusResponseDto })
  async getConfigStatus() {
    const status = this.configManagementService.getConfigStatus();

    return {
      code: 200,
      message: '获取成功',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清理过期配置版本' })
  @ApiResponse({ status: 200, description: '清理成功' })
  async cleanupOldVersions(@Query('retentionDays') retentionDays?: string) {
    const days = retentionDays ? parseInt(retentionDays) : 30;
    this.configManagementService.cleanupOldVersions(days);

    return {
      code: 200,
      message: '清理成功',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':key')
  @ApiOperation({ summary: '获取指定配置' })
  @ApiResponse({ status: 200, description: '获取成功', type: GetConfigResponseDto })
  async getConfig(@Param('key') key: string) {
    const config = this.configManagementService.getConfig(key);

    return {
      code: 200,
      message: '获取成功',
      data: config,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建配置' })
  @ApiResponse({ status: 200, description: '创建成功', type: GetConfigResponseDto })
  async createConfig(
    @Body() dto: UpdateConfigDto,
    @Query('changedBy') changedBy?: string
  ) {
    const config = this.configManagementService.createConfig(
      dto.key,
      dto.value,
      dto.description,
      changedBy || 'system'
    );

    return {
      code: 200,
      message: '创建成功',
      data: config,
      timestamp: new Date().toISOString(),
    };
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新配置' })
  @ApiResponse({ status: 200, description: '更新成功', type: GetConfigResponseDto })
  async updateConfig(
    @Body() dto: UpdateConfigDto,
    @Query('changedBy') changedBy?: string
  ) {
    const config = this.configManagementService.updateConfig(
      dto.key,
      dto.value,
      dto.description,
      changedBy || 'system'
    );

    return {
      code: 200,
      message: '更新成功',
      data: config,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量更新配置' })
  @ApiResponse({ status: 200, description: '批量更新成功', type: GetAllConfigsResponseDto })
  async batchUpdateConfigs(
    @Body() dto: BatchUpdateConfigDto,
    @Query('changedBy') changedBy?: string
  ) {
    const updatedConfigs: any[] = [];
    for (const configDto of dto.configs) {
      const config = this.configManagementService.updateConfig(
        configDto.key,
        configDto.value,
        configDto.description,
        changedBy || 'system'
      );
      updatedConfigs.push(config);
    }

    return {
      code: 200,
      message: '批量更新成功',
      data: updatedConfigs,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除配置' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteConfig(
    @Param('key') key: string,
    @Query('changedBy') changedBy?: string
  ) {
    this.configManagementService.deleteConfig(key, changedBy || 'system');

    return {
      code: 200,
      message: '删除成功',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':key/rollback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '回滚配置到指定版本' })
  @ApiResponse({ status: 200, description: '回滚成功', type: GetConfigResponseDto })
  async rollbackConfig(
    @Param('key') key: string,
    @Body() dto: RollbackConfigDto,
    @Query('changedBy') changedBy?: string
  ) {
    const config = this.configManagementService.rollbackConfig(
      key,
      dto.version,
      changedBy || 'system'
    );

    return {
      code: 200,
      message: '回滚成功',
      data: config,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':key/versions')
  @ApiOperation({ summary: '获取配置版本历史' })
  @ApiResponse({ status: 200, description: '获取成功', type: GetConfigVersionsResponseDto })
  async getConfigVersions(@Param('key') key: string) {
    const versions = this.configManagementService.getConfigVersions(key);

    return {
      code: 200,
      message: '获取成功',
      data: versions,
      timestamp: new Date().toISOString(),
    };
  }
}
