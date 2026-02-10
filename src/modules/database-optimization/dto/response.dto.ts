import { ApiProperty } from '@nestjs/swagger';

/** 慢查询响应DTO */
export class SlowQueryResponseDto {
  @ApiProperty({ description: '查询ID' })
  id: string;

  @ApiProperty({ description: '查询语句' })
  query: string;

  @ApiProperty({ description: '执行时长(ms)' })
  duration: number;

  @ApiProperty({ description: '时间戳' })
  timestamp: number;

  @ApiProperty({ description: '查询参数', required: false })
  parameters?: any[];

  @ApiProperty({ description: '连接名称', required: false })
  connectionName?: string;

  @ApiProperty({ description: '实体类型', required: false })
  entityType?: string;

  @ApiProperty({ description: '操作类型', required: false })
  operation?: string;
}

/** 慢查询统计响应DTO */
export class SlowQueryStatisticsResponseDto {
  @ApiProperty({ description: '慢查询总数' })
  totalSlowQueries: number;

  @ApiProperty({ description: '平均执行时长(ms)' })
  averageDuration: number;

  @ApiProperty({ description: '最大执行时长(ms)' })
  maxDuration: number;

  @ApiProperty({ description: '最小执行时长(ms)' })
  minDuration: number;

  @ApiProperty({ description: '按操作类型统计' })
  byOperation: Record<string, number>;

  @ApiProperty({ description: '按实体类型统计' })
  byEntityType: Record<string, number>;
}

/** 查询缓存统计响应DTO */
export class QueryCacheStatsResponseDto {
  @ApiProperty({ description: '总查询数' })
  totalQueries: number;

  @ApiProperty({ description: '缓存命中数' })
  cacheHits: number;

  @ApiProperty({ description: '缓存未命中数' })
  cacheMisses: number;

  @ApiProperty({ description: '缓存命中率(%)' })
  hitRate: number;

  @ApiProperty({ description: '缓存条目总数' })
  totalEntries: number;

  @ApiProperty({ description: '内存使用量(bytes)' })
  memoryUsage: number;
}

/** 读写分离统计响应DTO */
export class ReadWriteStatsResponseDto {
  @ApiProperty({ description: '总查询数' })
  totalQueries: number;

  @ApiProperty({ description: '主库查询数' })
  masterQueries: number;

  @ApiProperty({ description: '从库查询数' })
  slaveQueries: number;

  @ApiProperty({ description: '主库查询比例(%)' })
  masterRatio: number;

  @ApiProperty({ description: '从库查询比例(%)' })
  slaveRatio: number;
}

/** 数据库优化状态响应DTO */
export class DatabaseOptimizationStatusResponseDto {
  @ApiProperty({ description: '慢查询总数' })
  slowQueriesCount: number;

  @ApiProperty({ description: '缓存命中率(%)' })
  cacheHitRate: number;

  @ApiProperty({ description: '从库查询比例(%)' })
  slaveQueryRatio: number;

  @ApiProperty({ description: '读写分离是否启用' })
  readWriteSplitEnabled: boolean;

  @ApiProperty({ description: '查询缓存是否启用' })
  queryCacheEnabled: boolean;

  @ApiProperty({ description: '慢查询监控是否启用' })
  slowQueryEnabled: boolean;
}
