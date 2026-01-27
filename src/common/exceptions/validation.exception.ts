/**
 * 验证异常
 * 用于处理数据验证错误，如：参数格式错误、必填字段缺失等
 */

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * 验证异常
 * @description 用于处理数据验证错误，通常由验证管道触发
 * @example
 * throw new ValidationException('INVALID_EMAIL_FORMAT', '邮箱格式不正确');
 */
export class ValidationException extends BaseException {
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
