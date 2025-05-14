// auth.guard.ts
import { ApiResult } from "@/common/utils/result";
import { getPlatformJwtConfig } from "@/config/jwt";
import { WhiteList } from "@/config/whiteList";
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,

    private readonly jwtService: JwtService // JwtService 是 NestJS 提供的用于生成和验证 JWT 的服务
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse<Response>();
    const whiteListStartsWith = WhiteList.whiteListStartsWith;
    const whiteListExact = WhiteList.whiteListExact;
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
      let { __isApiResult, ...data } = ApiResult.error({ code: 401, message: "请登录后访问！", data: null });
      res.status(401).json(data);
      return false;
    }

    try {
      const options = getPlatformJwtConfig(url.split("/")[3]);
      if (options) {
        let payload: any, user: any;
        user = payload = this.jwtService.verify(token as string, {
          secret: options.secret,
        });
        // // 验证用户状态、如果不需要可以直接注释
        // user = await usersService.findOne(payload.id);
        // // 当前定义 2 为禁用
        // if (user.data.status === 2) {
        //   return res.status(403).json(ApiResult.error({ code: 403, message: "当前账号已被禁用，请联系管理员！", data: null }));
        // }
        req.userInfo = user; // 将用户信息附加到请求对象上
        console.log("req.userInfo :>> ", req.userInfo);
      }
      return true;
    } catch (error) {
      console.log('error :>> ', error);
      if (state) {
        return true;
      } else {
        res.status(401).json(ApiResult.error({ code: 401, message: "授权失败，Token无效！", data: null }));
        return false;
      }
    }
  }
}
