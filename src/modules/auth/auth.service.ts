import { Injectable } from '@nestjs/common';
import {
  CaptchaDto,
  LogInDto,
  UpdateUserDto,
  VerificationCodeLoginDto,
  SimpleLoginDto,
} from '@/modules/users/dto/index';
import { ApiResult } from '@/common/utils/result';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { getPlatformJwtConfig, JwtConfig } from '@/config/jwt';
import { Captcha, RefreshToken, UserLogin } from '@/types/user';
import { Role } from '@/modules/roles/entities/role.entity';
import { EmailCahce } from '@/types/email';
import { emailCache, svgCache, CAPTCHA_TTL } from '@/config/nodeCache';
import * as svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatusCodes } from '@/common/constants/http-status';
import { Response, Request } from 'express';
import { handlePlatformQuery } from '@/common/utils/query.util';
import * as dayjs from 'dayjs';
import { buildCommonVerify } from '@/common/utils/service.util';
import { bcryptService } from '@/common/utils/bcrypt-hash';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private readonly jwtService: JwtService
  ) {}

  /**
   * 人机校验
   * @param {CaptchaDto} captchaDto 参数
   * @returns {Promise<ApiResult<Captcha | null>>} 统一返回结果
   */
  async captcha(captchaDto: CaptchaDto): Promise<ApiResult<Captcha | null>> {
    try {
      const options = {
        size: 4,
        ignoreChars: '10ol',
        noise: 3,
        color: true,
        background: captchaDto.background || '#fff',
        width: Number(captchaDto.width) || 150,
        height: Number(captchaDto.height) || 50,
        fontSize: Number(captchaDto.fontSize) || 50,
      };

      const { text, data } = svgCaptcha.create(options);
      const base64 = Buffer.from(data).toString('base64');
      const url = `data:image/svg+xml;base64,${base64}`;
      const codeKey = uuidv4();
      await svgCache.set(codeKey, { text }, CAPTCHA_TTL);

      return ApiResult.success<Captcha>({
        data: {
          url,
          codeKey,
        },
      });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '生成验证码失败！');
    }
  }

  /**
   * 登录
   * @param {LogInDto} logInDto 登录参数
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<UserLogin | null>>} 统一返回结果
   */
  async logIn(
    logInDto: LogInDto,
    platform: string = 'admin'
  ): Promise<ApiResult<UserLogin | null>> {
    try {
      if (
        !(await buildCommonVerify({
          code: logInDto.code,
          codeKey: logInDto.codeKey,
        }))
      ) {
        return ApiResult.error('验证码错误或者不存在！');
      }

      const data = await this.userRepository.findOne({
        where: { account: logInDto.account, platform: handlePlatformQuery(platform, undefined) },
        relations: ['roles'],
      });

      if (!data) {
        return ApiResult.error<null>('账号不存在');
      }
      const status = await bcryptService.validateStr(logInDto.password, data.password);
      if (!status) {
        return ApiResult.error<null>('账号或密码错误');
      }

      // 这个状态需要自定义
      if (data.status === 2) {
        return ApiResult.error<null>('当前账号已被禁用，请联系管理员！');
      }
      const { password: _password, deletedAt: _deletedAt, ...info } = data;

      const options = getPlatformJwtConfig(platform) as JwtConfig;
      const userInfo = {
        userInfo: {
          ...info,
          createdAt: dayjs(info.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs(info.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        },
        token_type: 'Bearer ',
        access_token: this.jwtService.sign(info, {
          secret: options.secret,
          expiresIn: options.jwt_expires_in,
        }),
        refresh_token: this.jwtService.sign(
          { id: info.id },
          {
            secret: options.secret,
            expiresIn: options.jwt_refresh_expires_in,
          }
        ),
      };
      return ApiResult.success<UserLogin>({
        data: userInfo,
        message: '登录成功',
      });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '用户登录失败，请稍后再试');
    }
  }

  /**
   * 简化登录（仅账号密码，无需验证码，设置Cookie）
   * @param {SimpleLoginDto} simpleLoginDto 登录参数
   * @param {string} platform  平台(admin/web/app/mini)
   * @param {Response} res 响应对象
   * @returns {Promise<ApiResult<UserLogin | null>>} 统一返回结果
   */
  async simpleLogin(
    simpleLoginDto: SimpleLoginDto,
    platform: string = 'admin',
    res: Response
  ): Promise<ApiResult<UserLogin | null>> {
    try {
      const data = await this.userRepository.findOne({
        where: {
          account: simpleLoginDto.account,
          platform: handlePlatformQuery(platform, undefined),
        },
        relations: ['roles'],
      });

      if (!data) {
        return ApiResult.error<null>('账号不存在');
      }
      const status = await bcryptService.validateStr(simpleLoginDto.password, data.password);
      if (!status) {
        return ApiResult.error<null>('账号或密码错误');
      }

      if (data.status === 2) {
        return ApiResult.error<null>('当前账号已被禁用，请联系管理员！');
      }
      const { password: _password, deletedAt: _deletedAt, ...info } = data;

      const options = getPlatformJwtConfig(platform) as JwtConfig;
      const userInfo = {
        userInfo: {
          ...info,
          createdAt: dayjs(info.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs(info.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        },
        token_type: 'Bearer ',
        access_token: this.jwtService.sign(info, {
          secret: options.secret,
          expiresIn: options.jwt_expires_in,
        }),
        refresh_token: this.jwtService.sign(
          { id: info.id },
          {
            secret: options.secret,
            expiresIn: options.jwt_refresh_expires_in,
          }
        ),
      };

      res.cookie('token', userInfo.access_token, {
        maxAge: Number(options.jwt_expires_in),
      });
      res.cookie('refresh_token', userInfo.refresh_token, {
        maxAge: Number(options.jwt_refresh_expires_in),
      });

      return ApiResult.success<UserLogin>({
        data: userInfo,
        message: '登录成功',
      });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '用户登录失败，请稍后再试');
    }
  }

  /**
   * 用户登录(设置Cookie)
   * @param {LogInDto} logInDto 登录参数
   * @param {string} platform  平台(admin/web/app/mini)
   * @param {Response} res 响应对象
   * @returns {Promise<ApiResult<UserLogin | null>>} 统一返回结果
   */
  async logInSetCookie(
    loginDto: LogInDto,
    platform: string = 'admin',
    res: Response
  ): Promise<ApiResult<UserLogin | null>> {
    const result = await this.logIn(loginDto, platform);
    const data = result as { code: number; data: UserLogin };
    if (data.code == 200) {
      const options = getPlatformJwtConfig(platform) as JwtConfig;
      res.cookie('token', data.data.access_token, {
        maxAge: Number(options.jwt_expires_in),
      });
      res.cookie('refresh_token', data.data.refresh_token, {
        maxAge: Number(options.jwt_refresh_expires_in),
      });
    }
    return result;
  }

  /**
   * 使用 refresh_token 刷新token
   * @param {string} platform  平台(admin/web/app/mini)
   * @param {Request} req 请求对象
   * @param {Response} res 响应对象
   * @returns {Promise<ApiResult<RefreshToken | null>>} 统一返回结果
   */
  async refreshToken(
    platform: string = 'admin',
    req: Request,
    res: Response
  ): Promise<ApiResult<RefreshToken | null>> {
    try {
      let refresh_token: string | undefined;
      if (req.cookies && req.cookies.refresh_token) {
        refresh_token = req.cookies.refresh_token;
      }
      if (!refresh_token) {
        refresh_token = (req.headers['refresh_token'] as string)?.split(' ')[1];
      }
      if (!refresh_token) {
        return ApiResult.error<null>('refreshToken不存在，请先登录！');
      }

      const options = getPlatformJwtConfig(platform) as JwtConfig;
      const { id } = this.jwtService.verify<{ id: string }>(refresh_token, {
        secret: options.secret,
      });
      const user = await this.userRepository.findOne({
        where: { id, platform: handlePlatformQuery(platform, undefined) },
        relations: ['roles'],
      });
      if (!user) {
        return ApiResult.error<null>({
          data: null,
          message: '用户不存在',
          code: HttpStatusCodes.UNAUTHORIZED,
        });
      }

      const { password: _password, ...data } = user;
      const token = this.jwtService.sign(data, {
        secret: options.secret,
        expiresIn: options.jwt_expires_in,
      });

      res.cookie('token', token, {
        maxAge: Number(options.jwt_expires_in),
      });

      return ApiResult.success<RefreshToken>({
        data: {
          token_type: 'Bearer ',
          access_token: token,
        },
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return ApiResult.error<null>({
          data: null,
          message: '用户身份信息过期，请重新登录！',
          code: HttpStatusCodes.UNAUTHORIZED,
        });
      }
      return ApiResult.error<null>((error as Error)?.message || '刷新token失败，请重新登录！');
    }
  }

  /**
   * 邮箱登录
   * @param {VerificationCodeLoginDto} verificationCodeLogin
   * @param {string} platform 平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<UserLogin | null>>} 统一返回结果
   */
  async verificationCodeLogin(
    verificationCodeLogin: VerificationCodeLoginDto,
    platform: string = 'admin'
  ): Promise<ApiResult<UserLogin | null>> {
    try {
      const data = await this.userRepository.findOne({
        where: {
          email: verificationCodeLogin.email,
          platform: handlePlatformQuery(platform, undefined),
        },
        relations: ['roles'],
      });
      if (!data) {
        return ApiResult.error<null>('邮箱不存在');
      }
      const cacheData: EmailCahce = (await emailCache.get(
        verificationCodeLogin.email
      )) as EmailCahce;
      if (cacheData?.code !== verificationCodeLogin.emailCode) {
        return ApiResult.error<null>('验证码错误或已过期');
      }
      await emailCache.del(verificationCodeLogin.email);

      if (data.status === 2) {
        return ApiResult.error<null>('当前账号已被禁用，请联系管理员！');
      }
      const { password: _password, deletedAt: _deletedAt, ...info } = data;

      const options = getPlatformJwtConfig(platform) as JwtConfig;
      const userInfo = {
        userInfo: {
          ...info,
          createdAt: dayjs(info.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs(info.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        },
        token_type: 'Bearer ',
        access_token: this.jwtService.sign(info, {
          secret: options.secret,
          expiresIn: options.jwt_expires_in,
        }),
        refresh_token: this.jwtService.sign(
          { id: info.id },
          {
            secret: options.secret,
            expiresIn: options.jwt_refresh_expires_in,
          }
        ),
      };
      return ApiResult.success<UserLogin>({
        data: userInfo,
        message: '登录成功',
      });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '用户登录失败，请稍后再试');
    }
  }

  /**
   * 退出登录清除Cookie
   * @param {Response} res 响应对象
   */
  async logout(res: Response): Promise<ApiResult<null>> {
    res.cookie('token', '', { expires: new Date(0) });
    res.cookie('refresh_token', '', { expires: new Date(0) });
    return ApiResult.success<null>({
      data: null,
      message: '退出登录成功',
    });
  }
}
