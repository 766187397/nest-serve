// src/filters/route-not-found.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(NotFoundException)
export class RouteNotFoundFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.log("自定义路由不存在响应 :>> ");
    // 自定义路由不存在响应
    response.status(404).json({
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: "请求的路由不存在",
      suggestion: "请检查API路径是否正确",
    });
  }
}
