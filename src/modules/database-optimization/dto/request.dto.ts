import { ApiProperty } from '@nestjs/swagger';

/** 获取慢查询查询DTO */
export class GetSlowQueriesQueryDto {
  @ApiProperty({ description: '实体类型', required: false })
  entityType?: string;

  @ApiProperty({ description: '操作类型', required: false, enum: ['select', 'insert', 'update', 'delete', 'create', 'drop', 'alter'] })
  operation?: string;

  @ApiProperty({ description: '限制数量', required: false })
  limit?: number;
}

/** 使缓存失效请求DTO */
export class InvalidateCacheDto {
  @ApiProperty({ description: '查询语句' })
  query: string;

  @ApiProperty({ description: '查询参数', required: false })
  parameters?: any[];
}

/** 按模式使缓存失效请求DTO */
export class InvalidateCachePatternDto {
  @ApiProperty({ description: '缓存键模式' })
  pattern: string;
}

/** 设置读写比例请求DTO */
export class SetReadWriteRatioDto {
  @ApiProperty({ description: '读写比例 (0-1)', example: 0.7 })
  ratio: number;
}
