import { Controller, Get, Post, Body, Query, Req, Res, Headers, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LogInDto,
  VerificationCodeLoginDto,
  SimpleLoginDto,
  CaptchaDto,
} from '@/modules/users/dto/index';
import { ApiOperation, ApiResponse, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { FilterEmptyPipe } from '@/common/pipeTransform/filterEmptyPipe';
import { Request, Response } from 'express';
import {
  CaptchaResponseDto,
  UserLoginResponseDto,
  RefreshTokenResponseDto,
  CaptchaResponseWrapperDto,
  UserLoginResponseWrapperDto,
  RefreshTokenResponseWrapperDto,
} from './dto';

@ApiTags('认证管理')
@ApiResponse({ status: 200, description: '操作成功' })
@ApiResponse({ status: 201, description: '操作成功，无返回内容' })
@ApiResponse({ status: 400, description: '参数错误' })
@ApiResponse({ status: 401, description: 'token失效，请重新登录' })
@ApiResponse({ status: 403, description: '权限不足' })
@ApiResponse({ status: 404, description: '请求资源不存在' })
@ApiResponse({ status: 500, description: '服务器异常，请联系管理员' })
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('captcha')
  @ApiOperation({ summary: '获取验证码' })
  @ApiOkResponse({ type: () => CaptchaResponseWrapperDto, description: '获取验证码成功' })
  async captcha(@Query(new FilterEmptyPipe()) captchaDto: CaptchaDto) {
    return await this.authService.captcha(captchaDto);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiOkResponse({ type: () => UserLoginResponseWrapperDto, description: '用户登录成功' })
  logIn(@Headers('x-platform') platform: string, @Body() loginDto: LogInDto) {
    return this.authService.logIn(loginDto, platform);
  }

  @Post('simple-login')
  @ApiOperation({ summary: '简化登录（仅账号密码，设置Cookie）' })
  @ApiOkResponse({ type: () => UserLoginResponseWrapperDto, description: '简化登录成功' })
  simpleLogin(
    @Headers('x-platform') platform: string,
    @Body() simpleLoginDto: SimpleLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.simpleLogin(simpleLoginDto, platform, res);
  }

  @Post('login/set-cookie')
  @ApiOperation({ summary: '用户登录(设置Cookie)' })
  @ApiOkResponse({ type: () => UserLoginResponseWrapperDto, description: '用户登录成功' })
  async logInSetCookie(
    @Headers('x-platform') platform: string,
    @Body() loginDto: LogInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logInSetCookie(loginDto, platform, res);
  }

  @Post('verification-code-login')
  @ApiOperation({ summary: '邮箱验证码登录' })
  @ApiOkResponse({ type: () => UserLoginResponseWrapperDto, description: '邮箱验证码登录成功' })
  async verificationCodeLogin(
    @Headers('x-platform') platform: string,
    @Body() verificationCodeLogin: VerificationCodeLoginDto
  ) {
    return this.authService.verificationCodeLogin(verificationCodeLogin, platform);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: '刷新token' })
  @ApiOkResponse({ type: () => RefreshTokenResponseWrapperDto, description: '刷新token成功' })
  async refreshToken(
    @Headers('x-platform') platform: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refreshToken(platform, req, res);
  }

  @Post('logout')
  @ApiOperation({ summary: '退出登录清除Cookie' })
  @ApiOkResponse({ description: '退出登录成功' })
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
