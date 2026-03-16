import { ApiProperty } from '@nestjs/swagger';
import { ApiResultWrapperDto } from '@/common/dto/base';
import { RoleResponseDto } from '@/modules/roles/dto/response.dto';

/** 验证码响应DTO */
export class CaptchaResponseDto {
  @ApiProperty({ description: '验证码图片URL', example: 'data:image/png;base64,...' })
  url: string;

  @ApiProperty({ description: '验证码key', example: 'captcha_123456' })
  codeKey: string;
}

/** 用户信息响应DTO */
export class UserInfoResponseDto {
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

  @ApiProperty({ description: '角色列表', type: [RoleResponseDto] })
  roles: RoleResponseDto[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date | string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date | string;
}

/** 用户登录响应DTO */
export class UserLoginResponseDto {
  @ApiProperty({ description: '用户信息', type: UserInfoResponseDto })
  userInfo: UserInfoResponseDto;

  @ApiProperty({ description: 'token类型', example: 'Bearer' })
  token_type: string;

  @ApiProperty({ description: '访问token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ description: '刷新token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string;
}

/** 刷新token响应DTO */
export class RefreshTokenResponseDto {
  @ApiProperty({ description: '访问token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ description: 'token类型', example: 'Bearer' })
  token_type: string;
}

/** 验证码响应包装 DTO */
export class CaptchaResponseWrapperDto extends ApiResultWrapperDto<CaptchaResponseDto> {
  @ApiProperty({ description: '响应数据', type: CaptchaResponseDto })
  declare data: CaptchaResponseDto;
}

/** 用户信息响应包装 DTO */
export class UserInfoResponseWrapperDto extends ApiResultWrapperDto<UserInfoResponseDto> {
  @ApiProperty({ description: '响应数据', type: UserInfoResponseDto })
  declare data: UserInfoResponseDto;
}

/** 用户登录响应包装 DTO */
export class UserLoginResponseWrapperDto extends ApiResultWrapperDto<UserLoginResponseDto> {
  @ApiProperty({ description: '响应数据', type: UserLoginResponseDto })
  declare data: UserLoginResponseDto;
}

/** 刷新token响应包装 DTO */
export class RefreshTokenResponseWrapperDto extends ApiResultWrapperDto<RefreshTokenResponseDto> {
  @ApiProperty({ description: '响应数据', type: RefreshTokenResponseDto })
  declare data: RefreshTokenResponseDto;
}
