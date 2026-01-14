import { Controller, Get, Post, Body, Query, Req, Res, Headers, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LogInDto,
  VerificationCodeLoginDto,
  CaptchaDto,
  SimpleLoginDto,
} from '@/module/users/dto/index';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterEmptyPipe } from '@/common/pipeTransform/filterEmptyPipe';
import { Request, Response } from 'express';

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
  async captcha(@Query(new FilterEmptyPipe()) captchaDto: CaptchaDto) {
    return await this.authService.captcha(captchaDto);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  logIn(@Headers('x-platform') platform: string, @Body() loginDto: LogInDto) {
    return this.authService.logIn(loginDto, platform);
  }

  @Post('simple-login')
  @ApiOperation({ summary: '简化登录（仅账号密码）' })
  simpleLogin(@Headers('x-platform') platform: string, @Body() simpleLoginDto: SimpleLoginDto) {
    return this.authService.simpleLogin(simpleLoginDto, platform);
  }

  @Post('login/set-cookie')
  @ApiOperation({ summary: '用户登录(设置Cookie)' })
  async logInSetCookie(
    @Headers('x-platform') platform: string,
    @Body() loginDto: LogInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logInSetCookie(loginDto, platform, res);
  }

  @Post('verification-code-login')
  @ApiOperation({ summary: '邮箱验证码登录' })
  async verificationCodeLogin(
    @Headers('x-platform') platform: string,
    @Body() verificationCodeLogin: VerificationCodeLoginDto
  ) {
    return this.authService.verificationCodeLogin(verificationCodeLogin, platform);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: '刷新token' })
  async refreshToken(
    @Headers('x-platform') platform: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refreshToken(platform, req, res);
  }

  @Post('logout')
  @ApiOperation({ summary: '退出登录清除Cookie' })
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
