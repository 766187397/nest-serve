import { ApiProperty } from '@nestjs/swagger';
import { VerificationCodeDto } from '@/common/dto/base';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** 图形验证码请求DTO */
export class CaptchaDto {
  @ApiProperty({ description: '背景色', example: '#fff', required: false })
  @IsOptional()
  @IsString({ message: '背景色必须是字符串' })
  background?: string;

  @ApiProperty({ description: '宽', example: '150', required: false })
  @IsOptional()
  @IsString({ message: 'width必须是字符串' })
  width?: string;

  @ApiProperty({ description: '高', example: '50', required: false })
  @IsOptional()
  @IsString({ message: 'height必须是字符串' })
  height?: string;

  @ApiProperty({ description: '文字大小，最新建议50', required: false })
  @IsOptional()
  @IsString({ message: 'fontSize必须是字符串' })
  fontSize?: string;
}

/** 用户登录请求DTO */
export class LogInDto extends VerificationCodeDto {
  @ApiProperty({ description: '账号', example: 'admin' })
  @IsString({ message: '账号字符串' })
  @IsNotEmpty({ message: '账号是必填项' })
  account: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString({ message: '密码字符串' })
  @IsNotEmpty({ message: '密码是必填项' })
  password: string;
}

/** 简化登录请求DTO（仅账号密码） */
export class SimpleLoginDto {
  @ApiProperty({ description: '账号', example: 'admin' })
  @IsString({ message: '账号字符串' })
  @IsNotEmpty({ message: '账号是必填项' })
  account: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString({ message: '密码字符串' })
  @IsNotEmpty({ message: '密码是必填项' })
  password: string;
}

/** 邮箱验证码登录请求DTO */
export class VerificationCodeLoginDto {
  @ApiProperty({ description: '验证码', example: '123456' })
  @IsString({ message: '验证码字符串' })
  @IsNotEmpty({ message: '验证码是必填项' })
  emailCode: string;

  @ApiProperty({ description: '邮箱', example: '766187397@qq.com' })
  @IsEmail({}, { message: '邮箱格式错误' })
  @IsNotEmpty({ message: '邮箱是必填项' })
  email: string;
}

/** 刷新token请求DTO */
export class RefreshTokenRequestDto {
  @ApiProperty({ description: '刷新token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString({ message: '刷新token必须是字符串' })
  @IsNotEmpty({ message: '刷新token不能为空' })
  refresh_token: string;
}
