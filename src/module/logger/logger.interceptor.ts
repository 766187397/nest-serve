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
    request.startTime = Date.now();

    const url: string = request.url || "";
    // 如果是白名单中的接口就不记录到日志
    if (whiteListStartsWith.some((prefix) => url.startsWith(prefix)) || whiteListExact.includes(url)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        this.loggerService.create(request, data, response.statusCode.toString());
      })
    );
  }
}
