import { ApiProperty } from '@nestjs/swagger';

/** 验证码响应DTO */
export class CaptchaResponseDto {
  @ApiProperty({ description: '验证码图片URL', example: 'data:image/png;base64,...' })
  url: string;

  @ApiProperty({ description: '验证码key', example: 'captcha_123456' })
  codeKey: string;
}

/** 用户信息DTO */
export class UserInfoDto {
  @ApiProperty({ description: '账号', example: 'admin' })
  account: string;

  @ApiProperty({ description: '昵称', example: '管理员' })
  nickName: string;

  @ApiProperty({ description: '邮箱', example: 'admin@qq.com' })
  email: string;

  @ApiProperty({ description: '手机号', example: '13800138000' })
  phone: string;

  @ApiProperty({ description: '性别', example: '0' })
  sex: string;

  @ApiProperty({ description: '头像', example: '' })
  avatar: string;

  @ApiProperty({ description: '用户ID', example: '1' })
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
}

/** 用户登录响应DTO */
export class UserLoginDto {
  @ApiProperty({ description: '用户信息', type: UserInfoDto })
  userInfo: UserInfoDto;

  @ApiProperty({ description: 'token类型', example: 'Bearer' })
  token_type: string;

  @ApiProperty({ description: '访问token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ description: '刷新token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string;
}

/** 刷新token响应DTO */
export class RefreshTokenDto {
  @ApiProperty({ description: '访问token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ description: 'token类型', example: 'Bearer' })
  token_type: string;
}