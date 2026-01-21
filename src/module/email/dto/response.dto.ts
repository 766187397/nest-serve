import { ApiProperty } from '@nestjs/swagger';

/** 邮箱模板响应DTO */
export class EmailResponseDto {
  @ApiProperty({ description: '邮箱ID', example: '1' })
  id: number;

  @ApiProperty({ description: '邮箱模板标签', example: 'register' })
  type: string;

  @ApiProperty({ description: '邮箱标题', example: '注册成功' })
  title: string;

  @ApiProperty({ description: '邮箱内容', example: '<h1>欢迎注册</h1>' })
  content: string;

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