// src/filters/route-not-found.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException } from "@nestjs/common";
import { Request, Response } from "express";
import { ApiResult } from "@/common/utils/result";

@Catch(NotFoundException)
export class RouteNotFoundFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // 自定义路由不存在响应
    const { __isApiResult, ...data } = ApiResult.error<null>({
      code: 404,
      message: "请求的路由不存在或者请求方式错误,请检查API路径和请求方式是否正确",
      data: null,
    });
    response.status(404).json(data);
  }
}
