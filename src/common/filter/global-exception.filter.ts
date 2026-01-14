// src/filters/global-exception.filter.ts
import { LoggerService } from '@/module/logger/logger.service';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  PayloadTooLargeException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ApiResult } from '@/common/utils/result';
import { ConfigService } from '@nestjs/config';
import { ErrorCodes } from '@/common/constants/error-codes';

interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService
  ) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: string = ErrorCodes.INTERNAL_SERVER_ERROR;

    // 表单校验异常
    if (exception instanceof BadRequestException) {
      status = exception.getStatus();
      code = ErrorCodes.VALIDATION_ERROR;
      const exceptionResponse = exception.getResponse() as HttpExceptionResponse;
      message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(',')
        : exceptionResponse.message;
    }
    // 超出文件大小限制
    else if (exception instanceof PayloadTooLargeException) {
      status = exception.getStatus();
      code = ErrorCodes.FILE_TOO_LARGE;
      const maxSize = this.configService.get<number>('UPLOAD_MAX_SIZE') || 10 * 1024 * 1024;
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      message = `上传的文件超出了允许的大小限制！最大文件限制为 ${maxSizeMB}MB`;
    }
    // http异常
    else if (exception instanceof HttpException) {
      console.log('http异常', exception.getResponse());
      status = exception.getStatus();
      code = status.toString();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const responseMessage = (exceptionResponse as HttpExceptionResponse).message;
        message = Array.isArray(responseMessage) ? responseMessage.join(',') : responseMessage;
      }
    }
    // 处理数据库异常
    else if (exception instanceof QueryFailedError) {
      console.log('处理数据库异常');
      code = ErrorCodes.DATABASE_ERROR;
      message = exception.message;
    }
    // 处理其他Error类型
    else if (exception instanceof Error) {
      console.log('处理其他Error类型', exception);
      message = exception.stack || 'Internal server error';
    }

    const { __isApiResult, ...data } = ApiResult.error({
      code: parseInt(code, 10),
      message,
      data: null,
    });

    response.status(status).json(data);
  }
}
