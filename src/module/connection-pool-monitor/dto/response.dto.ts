import { ApiProperty } from '@nestjs/swagger';

/**
 * 连接池统计数据响应DTO
 * @description 用于传输连接池的实时状态统计信息，包括连接数、等待请求数等关键指标
 * @example
 * const stats = {
 *   totalConnections: 17,
 *   idleConnections: 4,
 *   activeConnections: 13,
 *   waitingRequests: 0,
 *   maxConnections: 17,
 *   minConnections: 4
 * };
 */
export class PoolStatsResponseDto {
  /** 总连接数 - 当前连接池中所有连接的总数 */
  @ApiProperty({ description: '总连接数', example: 17 })
  totalConnections: number;

  /** 空闲连接数 - 当前未被使用的连接数，可供新的请求使用 */
  @ApiProperty({ description: '空闲连接数', example: 4 })
  idleConnections: number;

  /** 活跃连接数 - 当前正在执行查询或事务的连接数 */
  @ApiProperty({ description: '活跃连接数', example: 13 })
  activeConnections: number;

  /** 等待获取连接的请求数 - 当前正在排队等待获取连接的请求数量 */
  @ApiProperty({ description: '等待获取连接的请求数', example: 0 })
  waitingRequests: number;

  /** 连接池最大连接数 - 连接池允许创建的最大连接数 */
  @ApiProperty({ description: '连接池最大连接数', example: 17 })
  maxConnections: number;

  /** 连接池最小连接数 - 连接池保持的最小连接数 */
  @ApiProperty({ description: '连接池最小连接数', example: 4 })
  minConnections: number;
}

/**
 * 连接池健康状态响应DTO
 * @description 用于传输连接池的健康检查结果，包括健康状态和问题列表
 * @example
 * const health = {
 *   healthy: true,
 *   issues: []
 * };
 */
export class PoolHealthResponseDto {
  /** 是否健康 - 连接池是否处于正常工作状态 */
  @ApiProperty({ description: '是否健康', example: true })
  healthy: boolean;

  /** 问题列表 - 连接池存在的所有问题列表，如果为空则表示无问题 */
  @ApiProperty({ description: '问题列表', example: [], type: [String] })
  issues: string[];
}

/**
 * 连接池历史记录项响应DTO
 * @description 用于传输连接池在特定时间点的状态记录，用于历史数据追踪和趋势分析
 * @example
 * const historyItem = {
 *   timestamp: 1768788407384,
 *   stats: {
 *     totalConnections: 17,
 *     idleConnections: 4,
 *     activeConnections: 13,
 *     waitingRequests: 0,
 *     maxConnections: 17,
 *     minConnections: 4
 *   }
 * };
 */
export class PoolHistoryItemResponseDto {
  /** 时间戳 - 记录该状态的时间戳（毫秒） */
  @ApiProperty({ description: '时间戳', example: 1768788407384 })
  timestamp: number;

  /** 连接池状态 - 该时间点的连接池统计信息 */
  @ApiProperty({ description: '连接池状态', type: PoolStatsResponseDto })
  stats: PoolStatsResponseDto;
}
