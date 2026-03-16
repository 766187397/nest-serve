/**
 * 自定义异常基类
 * 所有自定义异常都继承自此类
 */

import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 自定义异常基类
 * @description 提供统一的异常处理接口，所有自定义异常都应继承此类
 */
export abstract class BaseException extends HttpException {
  /**
   * 错误码
   */
  readonly errorCode: string;

  /**
   * 错误消息
   */
  readonly errorMessage: string;

  /**
   * 错误详情
   */
  readonly errorDetails?: Record<string, unknown>;

  /**
   * 构造函数
   * @param {string} errorCode - 错误码
   * @param {string} errorMessage - 错误消息
   * @param {HttpStatus} httpStatus - HTTP状态码
   * @param {Record<string, unknown>} errorDetails - 错误详情
   */
  constructor(
    errorCode: string,
    errorMessage: string,
    httpStatus: HttpStatus,
    errorDetails?: Record<string, unknown>
  ) {
    super(
      {
        code: errorCode,
        message: errorMessage,
        details: errorDetails,
      },
      httpStatus
    );

    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.errorDetails = errorDetails;
  }
}
