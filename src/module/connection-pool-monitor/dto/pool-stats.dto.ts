import { ApiProperty } from '@nestjs/swagger';

export class PoolStatsDto {
  @ApiProperty({ description: '总连接数', example: 17 })
  totalConnections: number;

  @ApiProperty({ description: '空闲连接数', example: 4 })
  idleConnections: number;

  @ApiProperty({ description: '活跃连接数', example: 13 })
  activeConnections: number;

  @ApiProperty({ description: '等待获取连接的请求数', example: 0 })
  waitingRequests: number;

  @ApiProperty({ description: '连接池最大连接数', example: 17 })
  maxConnections: number;

  @ApiProperty({ description: '连接池最小连接数', example: 4 })
  minConnections: number;
}

export class PoolHealthDto {
  @ApiProperty({ description: '是否健康', example: true })
  healthy: boolean;

  @ApiProperty({ description: '问题列表', example: [], type: [String] })
  issues: string[];
}

export class PoolHistoryItemDto {
  @ApiProperty({ description: '时间戳', example: 1768788407384 })
  timestamp: number;

  @ApiProperty({ description: '连接池状态', type: PoolStatsDto })
  stats: PoolStatsDto;
}
