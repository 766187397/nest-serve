// api-result.interceptor.ts
import { ResultWhiteList } from "@/config/whiteList";
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ApiResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    // 以什么开头
    const whiteListStartsWith: string[] = ResultWhiteList.whiteListStartsWith;
    // 以什么全匹配
    const whiteListExact: string[] = ResultWhiteList.whiteListExact;
    let whiteState = false;
    // 如果是白名单中的接口就不记录到日志
    if (whiteListStartsWith.some((prefix) => request.url.startsWith(prefix)) || whiteListExact.includes(request.url)) {
      whiteState = true;
    }
    return next.handle().pipe(
      map((data) => {
        if (data?.__isApiResult) {
          delete data.__isApiResult;
          response.status(data.code);
          return {
            code: data.code,
            message: data.message,
            data: data.data,
          };
        }
        // 如果是白名单中的接口就不处理响应
        else if (whiteState) {
          return data;
        }
        // 如果请求路径以 /api/v1/ 开头，又不是自定义的请求格式，则包装响应格式
        else if (request.url.startsWith("/api/v1/")) {
          return {
            code: 200,
            message: "操作成功",
            data,
          };
        }
        // 其他格式响应不处理
        return data;
      })
    );
  }
}
