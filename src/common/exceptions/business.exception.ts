/**
 * 业务异常
 * 用于处理业务逻辑错误，如：用户不存在、余额不足等
 */

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * 业务异常
 * @description 用于处理业务逻辑错误，通常由业务逻辑触发
 * @example
 * throw new BusinessException('USER_NOT_FOUND', '用户不存在');
 */
export class BusinessException extends BaseException {
  /**
   * 构造函数
   * @param {string} errorCode - 错误码
   * @param {string} errorMessage - 错误消息
   * @param {Record<string, unknown>} errorDetails - 错误详情
   */
  constructor(
    errorCode: string,
    errorMessage: string,
    errorDetails?: Record<string, unknown>
  ) {
    super(errorCode, errorMessage, HttpStatus.BAD_REQUEST, errorDetails);
  }
}
