import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { Observable, tap } from "rxjs";
import { LoggerWhiteList } from "@/config/whiteList";
import { Request } from "express";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 以什么开头
    const whiteListStartsWith: string[] = LoggerWhiteList.whiteListStartsWith;
    // 以什么全匹配
    const whiteListExact: string[] = LoggerWhiteList.whiteListExact;

    const request: Request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const url: string = request.url || "";
    // 如果是白名单中的接口就不记录到日志
    if (whiteListStartsWith.some((prefix) => url.startsWith(prefix)) || whiteListExact.includes(url)) {
      return next.handle();
    }
    const apiPlatform: string = url.split("/")[3] || "";
    const { account = "", nickName = "" } = request.userInfo || {};
    const method = request.method || "";
    let { referer = "", "sec-ch-ua-platform": platform = "", "sec-ch-ua": browser = "" } = request.headers;
    try {
      browser = (browser as string).replace(/"/g, "");
      platform = (platform as string).replace(/"/g, "");
    } catch (error) {
      platform = "";
      browser = "";
    }
    request.startTime = Date.now();

    // 获取客户端的 IP 地址
    const IP =
      (request.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      request.connection.remoteAddress ||
      request.ip ||
      "";
    // 在响应返回前记录日志
    return next.handle().pipe(
      tap(async (data) => {
        // `data` 是控制器返回给前端的响应体
        let resData = data;
        const statusCode = response.statusCode || "";
        const responseTime = Date.now() - request["startTime"] || 0; // 计算响应时间(毫秒)
        try {
          const data = {
            account,
            nickName,
            url,
            method,
            referer,
            apiPlatform,
            platform,
            browser,
            responseTime,
            resData,
            statusCode,
            IP,
          };

          if (!data.resData) {
            data.resData = "";
          }

          this.loggerService.create(data);

          if (statusCode >= 100 && statusCode < 200) {
            this.loggerService.info("信息响应", data);
          } else if (statusCode >= 200 && statusCode < 300) {
            this.loggerService.info("成功响应", data);
          } else if (statusCode >= 300 && statusCode < 400) {
            this.loggerService.info("重定向响应", data);
          } else if (statusCode >= 400 && statusCode < 500) {
            this.loggerService.warn("客户端错误响应", data);
          } else if (statusCode >= 500 && statusCode < 600) {
            this.loggerService.error("服务器错误响应", data);
          } else {
            this.loggerService.info("自定义响应", data);
          }
        } catch (error) {
          console.error("日志插入失败:", error);
        }
      })
    );
  }
}
