import { ApiProperty } from '@nestjs/swagger';

export class GetSlowQueriesQueryDto {
  @ApiProperty({ description: '实体类型', required: false })
  entityType?: string;

  @ApiProperty({ description: '操作类型', required: false, enum: ['select', 'insert', 'update', 'delete', 'create', 'drop', 'alter'] })
  operation?: string;

  @ApiProperty({ description: '限制数量', required: false })
  limit?: number;
}

export class InvalidateCacheDto {
  @ApiProperty({ description: '查询语句' })
  query: string;

  @ApiProperty({ description: '查询参数', required: false })
  parameters?: any[];
}

export class InvalidateCachePatternDto {
  @ApiProperty({ description: '缓存键模式' })
  pattern: string;
}

export class SetReadWriteRatioDto {
  @ApiProperty({ description: '读写比例 (0-1)', example: 0.7 })
  ratio: number;
}
