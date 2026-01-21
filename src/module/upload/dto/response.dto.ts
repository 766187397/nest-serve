import { ApiProperty } from '@nestjs/swagger';

/** 文件信息响应DTO */
export class UploadResponseDto {
  @ApiProperty({ description: '文件ID', example: '1' })
  id: string;

  @ApiProperty({ description: '文件名', example: 'example.jpg' })
  fileName: string;

  @ApiProperty({ description: '文件路径', example: '/uploads/example.jpg' })
  url: string;

  @ApiProperty({ description: '文件大小', example: 1024 })
  size: number;

  @ApiProperty({ description: '文件类型', example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ description: '大文件hash值', example: 'abc123', required: false })
  hash?: string;

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

/** 文件上传响应DTO */
export class UploadFileResponseDto {
  @ApiProperty({ description: '完整路径', example: '/uploads/file.txt' })
  completePath: string;

  @ApiProperty({ description: '文件URL', required: false, example: 'http://localhost:3000/uploads/file.txt' })
  url?: string;

  @ApiProperty({ description: '文件名', example: 'file.txt' })
  fileName: string;

  @ApiProperty({ description: '文件大小', example: 1024 })
  size: number;

  @ApiProperty({ description: '文件ID', example: '1' })
  id: string;

  @ApiProperty({ description: '排序', example: 1 })
  sort: number;

  @ApiProperty({ description: '状态', example: 1 })
  status: number;

  @ApiProperty({ description: '平台', required: false, example: 'web' })
  platform?: string;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date | string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date | string;

  @ApiProperty({ description: '删除时间', required: false, example: '2024-01-01T00:00:00.000Z' })
  deletedAt?: Date;
}
