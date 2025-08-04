// src/filters/global-exception.filter.ts
import { LoggerService } from "@/module/logger/logger.service";
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  PayloadTooLargeException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { QueryFailedError } from "typeorm";
import { ApiResult } from "@/common/utils/result";
import { FileUploadService } from "@/config/multer";

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
    // 表单校验异常
    if (exception instanceof BadRequestException) {
      status = exception.getStatus();
      message = (exception.getResponse() as any).message.join(",");
    }
    // 超出文件大小限制
    else if (exception instanceof PayloadTooLargeException) {
      status = exception.getStatus();
      message = `上传的文件超出了允许的大小限制！最大文件限制为 ${FileUploadService.MB}MB`;
    }
    // http异常
    else if (exception instanceof HttpException) {
      console.log("http异常", exception.getResponse());
      status = exception.getStatus();
      message =
        typeof exception.getResponse() === "string"
          ? exception.getResponse()
          : (exception.getResponse() as any).message;
    }
    // 处理数据库异常
    else if (exception instanceof QueryFailedError) {
      console.log("处理数据库异常");
      message = exception.message;
    }
    // 处理其他Error类型
    else if (exception instanceof Error) {
      console.log("处理其他Error类型", exception);
      message = exception.stack || "Internal server error";
    }

    const { __isApiResult, ...data } = ApiResult.error({
      code: status,
      message,
      data: null,
    });

    response.status(status).json(data);
  }
}
