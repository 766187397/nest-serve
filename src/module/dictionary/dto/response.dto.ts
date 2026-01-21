import { ApiProperty } from '@nestjs/swagger';

/** 字典项响应DTO */
export class DictionaryItemResponseDto {
  @ApiProperty({ description: '字典项ID', example: '1' })
  id: string;

  @ApiProperty({ description: '字典项标签', example: '男' })
  label: string;

  @ApiProperty({ description: '字典项值', example: '1' })
  value: string;

  @ApiProperty({ description: '排序', example: 1 })
  sort: number;

  @ApiProperty({ description: '状态 0禁用 1启用', example: 1 })
  status: number;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date | string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date | string;

  @ApiProperty({ description: '删除时间', required: false, example: '2024-01-01T00:00:00.000Z' })
  deletedAt?: Date;
}

/** 字典分类响应DTO */
export class DictionaryResponseDto {
  @ApiProperty({ description: '字典ID', example: '1' })
  id: string;

  @ApiProperty({ description: '字典分类类型', example: 'gender' })
  type: string;

  @ApiProperty({ description: '字典名称', example: '性别' })
  name: string;

  @ApiProperty({ description: '字典描述', example: '性别字典', required: false })
  description?: string;

  @ApiProperty({ description: '字典项列表', type: [DictionaryItemResponseDto] })
  items: DictionaryItemResponseDto[];

  @ApiProperty({ description: '排序', example: 1 })
  sort: number;

  @ApiProperty({ description: '状态 0禁用 1启用', example: 1 })
  status: number;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date | string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date | string;

  @ApiProperty({ description: '删除时间', required: false, example: '2024-01-01T00:00:00.000Z' })
  deletedAt?: Date;
}