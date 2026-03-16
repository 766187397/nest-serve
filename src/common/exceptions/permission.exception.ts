/**
 * 权限异常
 * 用于处理权限相关错误，如：未授权、权限不足等
 */

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

/**
 * 权限异常
 * @description 用于处理权限相关错误，通常由守卫或权限检查触发
 * @example
 * throw new PermissionException('PERMISSION_DENIED', '权限不足');
 */
export class PermissionException extends BaseException {
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
    super(errorCode, errorMessage, HttpStatus.FORBIDDEN, errorDetails);
  }
}
