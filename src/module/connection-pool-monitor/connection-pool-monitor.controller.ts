import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { ConnectionPoolMonitorService } from './connection-pool-monitor.service';
import { ApiResult } from '@/common/utils/result';
import { PoolStatsDto, PoolHealthDto, PoolHistoryItemDto } from './dto';

@ApiTags('连接池监控')
@ApiResponse({ status: 200, description: '操作成功' })
@ApiResponse({ status: 400, description: '参数错误' })
@ApiResponse({ status: 401, description: 'token失效，请重新登录' })
@ApiResponse({ status: 403, description: '权限不足' })
@ApiResponse({ status: 404, description: '请求资源不存在' })
@ApiResponse({ status: 500, description: '服务器异常，请联系管理员' })
@Controller('health/pool')
export class ConnectionPoolMonitorController {
  constructor(private readonly poolMonitorService: ConnectionPoolMonitorService) {}

  @Get('main')
  @ApiOperation({ summary: '获取主数据库连接池状态' })
  @ApiOkResponse({ type: PoolStatsDto, description: '主数据库连接池状态' })
  async getMainPoolStats() {
    const stats = await this.poolMonitorService.getMainPoolStats();
    return ApiResult.success<PoolStatsDto>({ data: stats as unknown as PoolStatsDto });
  }

  @Get('logger')
  @ApiOperation({ summary: '获取日志数据库连接池状态' })
  @ApiOkResponse({ type: PoolStatsDto, description: '日志数据库连接池状态' })
  async getLoggerPoolStats() {
    const stats = await this.poolMonitorService.getLoggerPoolStats();
    return ApiResult.success<PoolStatsDto>({ data: stats as unknown as PoolStatsDto });
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有数据库连接池状态' })
  @ApiOkResponse({ type: Object, description: '所有数据库连接池状态' })
  async getAllPoolStats() {
    const stats = await this.poolMonitorService.getAllPoolStats();
    return ApiResult.success<{ main: PoolStatsDto; logger: PoolStatsDto }>({
      data: stats as unknown as { main: PoolStatsDto; logger: PoolStatsDto },
    });
  }

  @Get('health')
  @ApiOperation({ summary: '获取连接池健康状态' })
  @ApiOkResponse({ type: Object, description: '连接池健康状态' })
  async getPoolHealth() {
    const health = await this.poolMonitorService.getPoolHealthStatus();
    return ApiResult.success<{ main: PoolHealthDto; logger: PoolHealthDto }>({
      data: health as unknown as { main: PoolHealthDto; logger: PoolHealthDto },
    });
  }

  @Get('history/main')
  @ApiOperation({ summary: '获取主数据库连接池历史数据' })
  @ApiOkResponse({ type: [PoolHistoryItemDto], description: '主数据库连接池历史数据' })
  async getMainPoolHistory() {
    const history = this.poolMonitorService.getStatsHistory('main', 20);
    return ApiResult.success<Array<PoolHistoryItemDto>>({
      data: history as unknown as Array<PoolHistoryItemDto>,
    });
  }

  @Get('history/logger')
  @ApiOperation({ summary: '获取日志数据库连接池历史数据' })
  @ApiOkResponse({ type: [PoolHistoryItemDto], description: '日志数据库连接池历史数据' })
  async getLoggerPoolHistory() {
    const history = this.poolMonitorService.getStatsHistory('logger', 20);
    return ApiResult.success<Array<PoolHistoryItemDto>>({
      data: history as unknown as Array<PoolHistoryItemDto>,
    });
  }
}
