// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@/module/roles/entities/role.entity";

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
    const user = request.userInfo;
    if (!user || !user.roles) {
      throw new UnauthorizedException({
        code: 401,
        message: "未授权访问：缺少用户角色信息",
      });
    }
    const hasRole = requiredRoles.some((role) => user.roles.some((item: Role) => item.roleKey === role));
    if (!hasRole) {
      throw new UnauthorizedException({
        code: 403,
        message: `拒绝访问：需要${requiredRoles.join("、")}角色`,
      });
    }
    return true;
  }
}
