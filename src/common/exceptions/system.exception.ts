/**
 * 系统异常
 * 用于处理系统级错误，如：数据库连接失败、服务不可用等
 */

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * 系统异常
 * @description 用于处理系统级错误，通常由基础设施或外部依赖触发
 * @example
 * throw new SystemException('DATABASE_CONNECTION_FAILED', '数据库连接失败');
 */
export class SystemException extends BaseException {
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
    super(errorCode, errorMessage, HttpStatus.INTERNAL_SERVER_ERROR, errorDetails);
  }
}
