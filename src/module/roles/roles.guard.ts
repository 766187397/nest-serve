// roles.guard.ts
import { ApiResult } from "@/common/utils/result";
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Response } from "express";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();
    const user = request.res.userinfo;

    if (!user || !user.roles) {
      let { __isApiResult, ...data } = ApiResult.error<null>({
        code: 401,
        message: "未授权访问：缺少用户角色信息",
      });
      response.status(401).json(data);
      return false;
    }
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      let { __isApiResult, ...data } = ApiResult.error<null>({
        code: 403,
        message: `拒绝访问：需要${requiredRoles.join("或")}角色`,
      });
      response.status(403).json(data);
      return false;
    }
    return true;
  }
}
