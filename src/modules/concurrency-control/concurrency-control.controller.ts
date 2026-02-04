import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CircuitBreakerService, CircuitState } from './circuit-breaker.service';
import { ServiceDegradationService } from './service-degradation.service';
import { DistributedLockService } from './distributed-lock.service';
import { ApiResult } from '@/common/utils/result';
import { SetGlobalDegradationLevelDto } from './dto/request.dto';

@ApiTags('并发控制')
@Controller('concurrency-control')
export class ConcurrencyControlController {
  constructor(
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly serviceDegradationService: ServiceDegradationService,
    private readonly distributedLockService: DistributedLockService
  ) {}

  @Get('circuit-breaker/:key')
  @ApiOperation({ summary: '获取熔断器状态' })
  @ApiParam({ name: 'key', description: '熔断器标识' })
  @ApiResponse({ status: 200, description: '成功获取熔断器状态' })
  async getCircuitBreakerState(@Param('key') key: string) {
    const state = this.circuitBreakerService.getState(key);
    return ApiResult.success({ data: state });
  }

  @Post('circuit-breaker/:key/reset')
  @ApiOperation({ summary: '重置熔断器' })
  @ApiParam({ name: 'key', description: '熔断器标识' })
  @ApiResponse({ status: 200, description: '成功重置熔断器' })
  async resetCircuitBreaker(@Param('key') key: string) {
    this.circuitBreakerService.reset(key);
    return ApiResult.success({ message: 'Circuit breaker reset successfully' });
  }

  @Post('circuit-breaker/reset-all')
  @ApiOperation({ summary: '重置所有熔断器' })
  @ApiResponse({ status: 200, description: '成功重置所有熔断器' })
  async resetAllCircuitBreakers() {
    this.circuitBreakerService.resetAll();
    return ApiResult.success({ message: 'All circuit breakers reset successfully' });
  }

  @Get('service-degradation/:serviceName')
  @ApiOperation({ summary: '获取服务降级状态' })
  @ApiParam({ name: 'serviceName', description: '服务名称' })
  @ApiResponse({ status: 200, description: '成功获取服务降级状态' })
  async getServiceDegradationStatus(@Param('serviceName') serviceName: string) {
    const status = this.serviceDegradationService.getServiceStatus(serviceName);
    return ApiResult.success({ data: status });
  }

  @Get('service-degradation')
  @ApiOperation({ summary: '获取所有服务降级状态' })
  @ApiResponse({ status: 200, description: '成功获取所有服务降级状态' })
  async getAllServiceDegradationStatus() {
    const status = this.serviceDegradationService.getAllServiceStatus();
    return ApiResult.success({ data: Object.fromEntries(status) });
  }

  @Post('service-degradation/:serviceName/degrade')
  @ApiOperation({ summary: '降级服务' })
  @ApiParam({ name: 'serviceName', description: '服务名称' })
  @ApiQuery({ name: 'level', description: '降级级别', required: false, type: Number })
  @ApiResponse({ status: 200, description: '成功降级服务' })
  async degradeService(
    @Param('serviceName') serviceName: string,
    @Query('level') level?: number
  ) {
    this.serviceDegradationService.degrade(serviceName, level || 1);
    return ApiResult.success({ message: 'Service degraded successfully' });
  }

  @Post('service-degradation/:serviceName/recover')
  @ApiOperation({ summary: '恢复服务' })
  @ApiParam({ name: 'serviceName', description: '服务名称' })
  @ApiResponse({ status: 200, description: '成功恢复服务' })
  async recoverService(@Param('serviceName') serviceName: string) {
    this.serviceDegradationService.recover(serviceName);
    return ApiResult.success({ message: 'Service recovered successfully' });
  }

  @Put('service-degradation/global-level')
  @ApiOperation({ summary: '设置全局降级级别' })
  @ApiBody({ type: SetGlobalDegradationLevelDto })
  @ApiResponse({ status: 200, description: '成功设置全局降级级别' })
  async setGlobalDegradationLevel(@Body() body: SetGlobalDegradationLevelDto) {
    this.serviceDegradationService.setGlobalDegradationLevel(body.level);
    return ApiResult.success({ message: 'Global degradation level set successfully' });
  }

  @Get('service-degradation/levels')
  @ApiOperation({ summary: '获取所有降级级别' })
  @ApiResponse({ status: 200, description: '成功获取所有降级级别' })
  async getDegradationLevels() {
    const levels = this.serviceDegradationService.getDegradationLevels();
    return ApiResult.success({ data: levels });
  }

  @Get('service-degradation/current-level')
  @ApiOperation({ summary: '获取当前降级级别' })
  @ApiResponse({ status: 200, description: '成功获取当前降级级别' })
  async getCurrentDegradationLevel() {
    const level = this.serviceDegradationService.getCurrentLevel();
    return ApiResult.success({ data: level });
  }

  @Get('distributed-lock/:key')
  @ApiOperation({ summary: '检查分布式锁状态' })
  @ApiParam({ name: 'key', description: '锁标识' })
  @ApiResponse({ status: 200, description: '成功获取锁状态' })
  async isLocked(@Param('key') key: string) {
    const locked = await this.distributedLockService.isLocked(key);
    return ApiResult.success({ data: { locked } });
  }

  @Get('distributed-lock/active')
  @ApiOperation({ summary: '获取所有活跃的分布式锁' })
  @ApiResponse({ status: 200, description: '成功获取所有活跃的分布式锁' })
  async getActiveLocks() {
    const locks = this.distributedLockService.getActiveLocks();
    return ApiResult.success({ data: { locks } });
  }

  @Delete('distributed-lock/:key/force-release')
  @ApiOperation({ summary: '强制释放分布式锁' })
  @ApiParam({ name: 'key', description: '锁标识' })
  @ApiResponse({ status: 200, description: '成功强制释放锁' })
  async forceReleaseLock(@Param('key') key: string) {
    const success = await this.distributedLockService.forceReleaseLock(key);
    return ApiResult.success({ data: { success } });
  }

  @Get('status')
  @ApiOperation({ summary: '获取并发控制整体状态' })
  @ApiResponse({ status: 200, description: '成功获取并发控制整体状态' })
  async getOverallStatus() {
    const serviceDegradation = this.serviceDegradationService;
    const distributedLocks = this.distributedLockService;

    return ApiResult.success({
      data: {
        circuitBreakers: {
          activeCircuits: 0,
          openCircuits: 0,
        },
        serviceDegradation: {
          currentLevel: serviceDegradation.getCurrentLevel(),
          degradedServices: Array.from(serviceDegradation.getAllServiceStatus().entries())
            .filter(([_, status]) => status.isDegraded)
            .map(([name, _]) => name),
        },
        distributedLocks: {
          activeLocks: distributedLocks.getActiveLocks(),
        },
      },
    });
  }
}
