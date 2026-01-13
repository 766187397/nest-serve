/**
 * 统一错误码管理
 * @description 定义系统中所有错误码，用于统一错误处理和响应格式
 * @example
 * import { ErrorCodes } from '@/common/constants/error-codes';
 * throw new HttpException(
 *   { code: ErrorCodes.BAD_REQUEST, message: '参数错误' },
 *   HttpStatus.BAD_REQUEST
 * );
 */
export const ErrorCodes = {
  SUCCESS: '00000',
  BAD_REQUEST: '40000',
  UNAUTHORIZED: '40100',
  FORBIDDEN: '40300',
  NOT_FOUND: '40400',
  METHOD_NOT_ALLOWED: '40500',
  INTERNAL_SERVER_ERROR: '50000',
  BAD_GATEWAY: '50200',
  SERVICE_UNAVAILABLE: '50300',
  GATEWAY_TIMEOUT: '50400',

  // 业务错误码 6xxxx
  USER_NOT_FOUND: '60001',
  USER_ALREADY_EXISTS: '60002',
  INVALID_PASSWORD: '60003',
  TOKEN_EXPIRED: '60004',
  TOKEN_INVALID: '60005',
  PERMISSION_DENIED: '60006',

  // 数据库错误码 7xxxx
  DATABASE_ERROR: '70001',
  DATABASE_CONNECTION_ERROR: '70002',
  DUPLICATE_ENTRY: '70003',

  // 文件上传错误码 8xxxx
  FILE_TOO_LARGE: '80001',
  FILE_TYPE_NOT_ALLOWED: '80002',
  FILE_UPLOAD_FAILED: '80003',

  // 参数校验错误码 9xxxx
  VALIDATION_ERROR: '90001',
  MISSING_REQUIRED_FIELD: '90002',
  INVALID_FORMAT: '90003',
} as const;

/**
 * 错误码对应的HTTP状态码映射
 * @description 将错误码映射到对应的HTTP状态码
 */
export const ErrorCodeToHttpStatus: Record<string, number> = {
  [ErrorCodes.SUCCESS]: 200,
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.METHOD_NOT_ALLOWED]: 405,
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCodes.BAD_GATEWAY]: 502,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.GATEWAY_TIMEOUT]: 504,

  [ErrorCodes.USER_NOT_FOUND]: 404,
  [ErrorCodes.USER_ALREADY_EXISTS]: 409,
  [ErrorCodes.INVALID_PASSWORD]: 401,
  [ErrorCodes.TOKEN_EXPIRED]: 401,
  [ErrorCodes.TOKEN_INVALID]: 401,
  [ErrorCodes.PERMISSION_DENIED]: 403,

  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.DATABASE_CONNECTION_ERROR]: 503,
  [ErrorCodes.DUPLICATE_ENTRY]: 409,

  [ErrorCodes.FILE_TOO_LARGE]: 413,
  [ErrorCodes.FILE_TYPE_NOT_ALLOWED]: 415,
  [ErrorCodes.FILE_UPLOAD_FAILED]: 500,

  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCodes.INVALID_FORMAT]: 400,
};

/**
 * 根据错误码获取对应的HTTP状态码
 * @param {string} code - 错误码
 * @returns {number} HTTP状态码
 * @description 如果错误码不存在映射，默认返回500
 * @example
 * const status = getHttpStatusByErrorCode(ErrorCodes.USER_NOT_FOUND); // 404
 */
export function getHttpStatusByErrorCode(code: string): number {
  return ErrorCodeToHttpStatus[code] || 500;
}
