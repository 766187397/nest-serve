// api-result.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResult } from "@/common/utils/result";

@Injectable()
export class ApiResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // 如果已经是 ApiResult 实例，直接使用它的状态码和消息
        if (data instanceof ApiResult) {
          response.status(data.code);
          return {
            code: data.code,
            message: data.message,
            data: data.data,
          };
        }
        // 如果请求路径以 /api 开头，则包装成成功的响应
        else if (request.url.startsWith("/api/")) {
          // 否则包装成成功的响应
          response.status(HttpStatus.OK);
          return {
            code: HttpStatus.OK,
            message: "操作成功",
            data,
          };
        }
        return data;
      })
    );
  }
}
