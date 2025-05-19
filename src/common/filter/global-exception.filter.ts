// src/filters/global-exception.filter.ts
import { LoggerService } from "@/module/logger/logger.service";
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { Request, Response } from "express";
import { QueryFailedError } from "typeorm";
import { ApiResult } from "@/common/utils/result";
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = "Internal server error";
    const url: string = request.url || "";
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

    // 获取客户端的 IP 地址
    const IP =
      (request.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      request.connection.remoteAddress ||
      request.ip ||
      "";

    const statusCode = response.statusCode || "";
    // http异常
    if (exception instanceof HttpException) {
      console.log("http异常 :>> ");
      status = exception.getStatus();
      message = exception.message;
    }
    // 处理数据库异常
    else if (exception instanceof QueryFailedError) {
      console.log("处理数据库异常 :>> ");
      message = exception.message;
    }
    // 处理其他Error类型
    else if (exception instanceof Error) {
      console.log("处理其他Error类型 :>> ");
      message = exception.stack || "Internal server error";
    }

    // 记录错误日志
    this.loggerService.error(`[${new Date().toISOString()}] Error:`, {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
      stack: exception instanceof Error ? exception.stack : null,
      data: {
        account,
        nickName,
        url,
        method,
        referer,
        apiPlatform,
        platform,
        browser,
        statusCode,
        IP,
      },
    });

    const { __isApiResult, ...data } = ApiResult.error({
      code: status,
      message,
      data: null,
    });
    response.status(status).json(data);
  }
}
