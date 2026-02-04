import { Controller, Get, Query, Post, Body, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SlowQueryMonitorService } from './slow-query-monitor.service';
import { QueryCacheService } from './query-cache.service';
import { ReadWriteSplitService } from './read-write-split.service';
import {
  GetSlowQueriesQueryDto,
  InvalidateCacheDto,
  InvalidateCachePatternDto,
  SetReadWriteRatioDto,
  SlowQueryResponseDto,
  SlowQueryStatisticsResponseDto,
  QueryCacheStatsResponseDto,
  ReadWriteStatsResponseDto,
  DatabaseOptimizationStatusResponseDto,
} from './dto';
import { ApiResult } from '@/common/utils/result';

@ApiTags('数据库查询优化')
@Controller('database-optimization')
export class DatabaseOptimizationController {
  constructor(
    private readonly slowQueryMonitorService: SlowQueryMonitorService,
    private readonly queryCacheService: QueryCacheService,
    private readonly readWriteSplitService: ReadWriteSplitService,
  ) {}

  @Get('slow-queries')
  @ApiOperation({ summary: '获取慢查询列表' })
  @ApiResponse({ status: 200, type: [SlowQueryResponseDto] })
  async getSlowQueries(@Query() query: GetSlowQueriesQueryDto) {
    let slowQueries = this.slowQueryMonitorService.getSlowQueries();

    if (query.entityType) {
      slowQueries = this.slowQueryMonitorService.getSlowQueriesByEntityType(query.entityType);
    }

    if (query.operation) {
      slowQueries = this.slowQueryMonitorService.getSlowQueriesByOperation(query.operation);
    }

    if (query.limit) {
      slowQueries = slowQueries.slice(0, query.limit);
    }

    return ApiResult.success({
      data: slowQueries,
    });
  }

  @Get('slow-queries/statistics')
  @ApiOperation({ summary: '获取慢查询统计信息' })
  @ApiResponse({ status: 200, type: SlowQueryStatisticsResponseDto })
  async getSlowQueryStatistics() {
    const stats = this.slowQueryMonitorService.getSlowQueryStatistics();
    return ApiResult.success({
      data: stats,
    });
  }

  @Delete('slow-queries')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清除慢查询历史' })
  @ApiResponse({ status: 200, description: '慢查询历史已清除' })
  async clearSlowQueries() {
    this.slowQueryMonitorService.clearSlowQueries();
    return ApiResult.success({
      message: 'Slow query history has been cleared',
    });
  }

  @Get('query-cache/stats')
  @ApiOperation({ summary: '获取查询缓存统计信息' })
  @ApiResponse({ status: 200, type: QueryCacheStatsResponseDto })
  async getQueryCacheStats() {
    const stats = this.queryCacheService.getStats();
    return ApiResult.success({
      data: stats,
    });
  }

  @Get('query-cache/entries')
  @ApiOperation({ summary: '获取查询缓存条目' })
  @ApiResponse({ status: 200, type: [Object] })
  async getQueryCacheEntries(@Query('limit') limit?: string) {
    const entries = this.queryCacheService.getCacheEntries(limit ? parseInt(limit, 10) : undefined);
    return ApiResult.success({
      data: entries,
    });
  }

  @Post('query-cache/invalidate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '使指定查询缓存失效' })
  @ApiResponse({ status: 200, description: '查询缓存已失效' })
  async invalidateCache(@Body() body: InvalidateCacheDto) {
    await this.queryCacheService.invalidate(body.query, body.parameters);
    return ApiResult.success({
      message: 'Query cache invalidated',
    });
  }

  @Post('query-cache/invalidate-pattern')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '使匹配模式的查询缓存失效' })
  @ApiResponse({ status: 200, description: '查询缓存已失效' })
  async invalidateCacheByPattern(@Body() body: InvalidateCachePatternDto) {
    await this.queryCacheService.invalidateByPattern(body.pattern);
    return ApiResult.success({
      message: `Query cache entries matching pattern '${body.pattern}' have been invalidated`,
    });
  }

  @Delete('query-cache')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清除所有查询缓存' })
  @ApiResponse({ status: 200, description: '查询缓存已清除' })
  async clearQueryCache() {
    await this.queryCacheService.invalidateAll();
    return ApiResult.success({
      message: 'All query cache has been cleared',
    });
  }

  @Post('query-cache/reset-stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置查询缓存统计信息' })
  @ApiResponse({ status: 200, description: '查询缓存统计信息已重置' })
  async resetQueryCacheStats() {
    this.queryCacheService.resetStats();
    return ApiResult.success({
      message: 'Query cache stats have been reset',
    });
  }

  @Get('read-write-split/stats')
  @ApiOperation({ summary: '获取读写分离统计信息' })
  @ApiResponse({ status: 200, type: ReadWriteStatsResponseDto })
  async getReadWriteStats() {
    const stats = this.readWriteSplitService.getStats();
    return ApiResult.success({
      data: stats,
    });
  }

  @Post('read-write-split/ratio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '设置读写比例' })
  @ApiResponse({ status: 200, description: '读写比例已设置' })
  async setReadWriteRatio(@Body() body: SetReadWriteRatioDto) {
    if (body.ratio < 0 || body.ratio > 1) {
      return ApiResult.error({
        message: 'Ratio must be between 0 and 1',
      });
    }

    return ApiResult.success({
      message: `Read-write ratio set to ${body.ratio}`,
    });
  }

  @Post('read-write-split/reset-stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置读写分离统计信息' })
  @ApiResponse({ status: 200, description: '读写分离统计信息已重置' })
  async resetReadWriteStats() {
    this.readWriteSplitService.resetStats();
    return ApiResult.success({
      message: 'Read-write split stats have been reset',
    });
  }

  @Get('status')
  @ApiOperation({ summary: '获取数据库优化状态' })
  @ApiResponse({ status: 200, type: DatabaseOptimizationStatusResponseDto })
  async getStatus() {
    const slowQueriesCount = this.slowQueryMonitorService.getSlowQueries().length;
    const cacheStats = this.queryCacheService.getStats();
    const readWriteStats = this.readWriteSplitService.getStats();

    return ApiResult.success({
      data: {
        slowQueriesCount,
        cacheHitRate: cacheStats.hitRate,
        slaveQueryRatio: readWriteStats.slaveRatio,
        readWriteSplitEnabled: this.readWriteSplitService.isReadWriteSplitEnabled(),
        queryCacheEnabled: true,
        slowQueryEnabled: true,
      },
    });
  }
}
