// auth.guard.ts
import { ApiResult } from "@/common/utils/result";
import { getPlatformJwtConfig } from "@/config/jwt";
import { JWTWhiteList } from "@/config/whiteList";
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService // JwtService 是 NestJS 提供的用于生成和验证 JWT 的服务
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse<Response>();
    const whiteListStartsWith = JWTWhiteList.whiteListStartsWith;
    const whiteListExact = JWTWhiteList.whiteListExact;
    let state = false; // 是否匹配白名单
    const url = req.url;
    // 检查白名单
    if (whiteListStartsWith.some((prefix) => url.startsWith(prefix)) || whiteListExact.includes(url)) {
      state = true; // 如果匹配白名单，跳过 JWT 验证
    }

    let token: string | undefined;
    // 首先尝试从 Cookie 中获取 Token
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 如果没有从 Cookie 中获取到 Token，则尝试从请求头中获取
    if (!token) {
      token = req.headers["authorization"]?.split(" ")[1]; // 从请求头获取 Bearer Token
    }
    if (!token && !state) {
      // let { __isApiResult, ...data } = ApiResult.error({ code: 401, message: "请登录后访问！", data: null });
      throw new HttpException("请登录后访问！", HttpStatus.UNAUTHORIZED);
      return false;
    }

    try {
      const options = getPlatformJwtConfig(url.split("/")[3]);
      if (options && token) {
        let user: any;
        user = this.jwtService.verify(token as string, {
          secret: options.secret,
        });
        req.userInfo = user; // 将用户信息附加到请求对象上
      }
      return true;
    } catch (error) {
      if (state) {
        return true;
      } else {
        throw new HttpException("授权失败，Token无效！", HttpStatus.UNAUTHORIZED);
        return false;
      }
    }
  }
}
