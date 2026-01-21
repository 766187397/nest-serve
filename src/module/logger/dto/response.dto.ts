import { ApiProperty } from '@nestjs/swagger';

/** 日志信息响应DTO */
export class LogResponseDto {
  @ApiProperty({ description: '日志ID', example: '1' })
  id: string;

  @ApiProperty({ description: '用户账号', example: 'admin' })
  account: string;

  @ApiProperty({ description: '用户昵称', example: '管理员' })
  nickName: string;

  @ApiProperty({ description: '请求URL', example: '/api/v1/users' })
  url: string;

  @ApiProperty({ description: '请求方式', example: 'GET' })
  method: string;

  @ApiProperty({ description: '请求来源', example: 'http://localhost:3000' })
  referer: string;

  @ApiProperty({ description: '接口平台', example: 'web' })
  apiPlatform: string;

  @ApiProperty({ description: '浏览器', example: 'Chrome' })
  browser: string;

  @ApiProperty({ description: '响应时间(毫秒)', example: 100 })
  responseTime: number;

  @ApiProperty({ description: '响应内容', example: '{"code":200,"message":"success"}' })
  resData: string;

  @ApiProperty({ description: '状态码', example: '200' })
  statusCode: string;

  @ApiProperty({ description: 'IP地址', example: '127.0.0.1' })
  IP: string;

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