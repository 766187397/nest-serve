// src/filters/global-exception.filter.ts
import { LoggerService } from '@/modules/logger/logger.service';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  PayloadTooLargeException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ApiResult } from '@/common/utils/result';
import { ConfigService } from '@nestjs/config';
import { ErrorCodes, getHttpStatusByErrorCode, getErrorMessageByErrorCode } from '@/common/constants/error-codes';
import { filterErrorSensitiveData, filterSensitiveData, filterSensitiveString } from '@/common/utils/sensitive-data-filter';
import { BaseException } from '@/common/exceptions/base.exception';
import { BusinessException } from '@/common/exceptions/business.exception';
import { SystemException } from '@/common/exceptions/system.exception';
import { ValidationException } from '@/common/exceptions/validation.exception';
import { PermissionException } from '@/common/exceptions/permission.exception';

interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

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
    let details: Record<string, unknown> | undefined;

    // 自定义异常处理
    if (exception instanceof BaseException) {
      status = exception.getStatus();
      code = exception.errorCode;
      message = exception.errorMessage;
      details = exception.errorDetails;

      if (exception instanceof BusinessException) {
        this.logger.warn(`业务异常: ${code} - ${message}`, details);
      } else if (exception instanceof SystemException) {
        this.logger.error(`系统异常: ${code} - ${message}`, details);
      } else if (exception instanceof ValidationException) {
        this.logger.warn(`验证异常: ${code} - ${message}`, details);
      } else if (exception instanceof PermissionException) {
        this.logger.warn(`权限异常: ${code} - ${message}`, details);
      } else {
        this.logger.error(`未知异常: ${code} - ${message}`, details);
      }
    }
    // 表单校验异常
    else if (exception instanceof BadRequestException) {
      status = exception.getStatus();
      code = ErrorCodes.VALIDATION_ERROR;
      const exceptionResponse = exception.getResponse() as HttpExceptionResponse;
      message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(',')
        : exceptionResponse.message;
      this.logger.warn(`表单校验异常: ${message}`);
    }
    // 超出文件大小限制
    else if (exception instanceof PayloadTooLargeException) {
      status = exception.getStatus();
      code = ErrorCodes.FILE_TOO_LARGE;
      const maxSize = this.configService.get<number>('UPLOAD_MAX_SIZE') || 10 * 1024 * 1024;
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      message = `上传的文件超出了允许的大小限制！最大文件限制为 ${maxSizeMB}MB`;
      this.logger.warn(message);
    }
    // http异常
    else if (exception instanceof HttpException) {
      const filteredResponse = filterSensitiveData(exception.getResponse());
      this.logger.warn('http异常', filteredResponse);
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
      this.logger.error('处理数据库异常', exception);
      code = ErrorCodes.DATABASE_ERROR;
      message = exception.message;
    }
    // 处理其他Error类型
    else if (exception instanceof Error) {
      const filteredError = filterErrorSensitiveData(exception);
      this.logger.error('处理其他Error类型', filteredError);
      message = exception.stack || 'Internal server error';
      // 过滤错误消息中的敏感信息
      message = filterSensitiveString(message);
    }

    const { __isApiResult, ...data } = ApiResult.error({
      code: parseInt(code, 10),
      message,
      data: null,
      details,
    });

    response.status(status).json(data);

    this.loggerService.create(request, message, status.toString());
  }
}
