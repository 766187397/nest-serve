import { ApiProperty } from '@nestjs/swagger';

/** 角色信息响应DTO */
export class RoleResponseDto {
  @ApiProperty({ description: '角色ID', example: '1' })
  id: string;

  @ApiProperty({ description: '角色名称', example: 'admin' })
  name: string;

  @ApiProperty({ description: '角色标识', example: 'admin' })
  roleKey: string;

  @ApiProperty({ description: '角色描述', example: '管理员' })
  description: string;

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

/** 用户信息响应DTO */
export class UserResponseDto {
  @ApiProperty({ description: '用户ID', example: '1' })
  id: string;

  @ApiProperty({ description: '用户账号', example: 'admin' })
  account: string;

  @ApiProperty({ description: '用户昵称', example: '管理员' })
  nickName: string;

  @ApiProperty({ description: '邮箱', example: 'admin@qq.com' })
  email: string;

  @ApiProperty({ description: '手机号', example: '13800138000' })
  phone: string;

  @ApiProperty({ description: '性别 0未知 1男 2女', example: '0' })
  sex: string;

  @ApiProperty({ description: '头像', example: '' })
  avatar: string;

  @ApiProperty({ description: '角色列表', type: [RoleResponseDto] })
  roles: RoleResponseDto[];

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
