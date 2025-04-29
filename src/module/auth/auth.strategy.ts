import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        // 从 cookie 获取 token
        const cookieToken = req.cookies["token"]; // 根据你的 cookie 名称
        if (cookieToken) {
          return cookieToken;
        }

        // 如果 cookie 中没有 token，再从 Authorization header 获取
        const headerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        return headerToken;
      },
      ignoreExpiration: false, // 设置为 true 时，过期的 JWT 也会被接受
      secretOrKey: process.env.JWT_SECRET as string, // 使用环境变量管理更安全
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
