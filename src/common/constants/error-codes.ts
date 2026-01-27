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
  INSUFFICIENT_BALANCE: '60007',
  ORDER_NOT_FOUND: '60008',
  PRODUCT_OUT_OF_STOCK: '60009',
  INVALID_OPERATION: '60010',
  RESOURCE_LOCKED: '60011',
  DUPLICATE_OPERATION: '60012',

  // 数据库错误码 7xxxx
  DATABASE_ERROR: '70001',
  DATABASE_CONNECTION_ERROR: '70002',
  DUPLICATE_ENTRY: '70003',
  DATABASE_TIMEOUT: '70004',
  DATABASE_CONSTRAINT_VIOLATION: '70005',

  // 文件上传错误码 8xxxx
  FILE_TOO_LARGE: '80001',
  FILE_TYPE_NOT_ALLOWED: '80002',
  FILE_UPLOAD_FAILED: '80003',
  FILE_NOT_FOUND: '80004',
  FILE_DELETE_FAILED: '80005',

  // 参数校验错误码 9xxxx
  VALIDATION_ERROR: '90001',
  MISSING_REQUIRED_FIELD: '90002',
  INVALID_FORMAT: '90003',
  INVALID_EMAIL: '90004',
  INVALID_PHONE: '90005',
  INVALID_ID_CARD: '90006',
  INVALID_URL: '90007',
  INVALID_DATE: '90008',

  // 系统错误码 5xxxx（扩展）
  SYSTEM_ERROR: '50001',
  SERVICE_UNAVAILABLE_ERROR: '50002',
  RATE_LIMIT_EXCEEDED: '50003',
  CIRCUIT_BREAKER_OPEN: '50004',
  CACHE_ERROR: '50005',
  QUEUE_ERROR: '50006',
  MESSAGE_QUEUE_ERROR: '50007',
  EXTERNAL_SERVICE_ERROR: '50008',
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
  [ErrorCodes.INSUFFICIENT_BALANCE]: 400,
  [ErrorCodes.ORDER_NOT_FOUND]: 404,
  [ErrorCodes.PRODUCT_OUT_OF_STOCK]: 400,
  [ErrorCodes.INVALID_OPERATION]: 400,
  [ErrorCodes.RESOURCE_LOCKED]: 423,
  [ErrorCodes.DUPLICATE_OPERATION]: 409,

  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.DATABASE_CONNECTION_ERROR]: 503,
  [ErrorCodes.DUPLICATE_ENTRY]: 409,
  [ErrorCodes.DATABASE_TIMEOUT]: 504,
  [ErrorCodes.DATABASE_CONSTRAINT_VIOLATION]: 400,

  [ErrorCodes.FILE_TOO_LARGE]: 413,
  [ErrorCodes.FILE_TYPE_NOT_ALLOWED]: 415,
  [ErrorCodes.FILE_UPLOAD_FAILED]: 500,
  [ErrorCodes.FILE_NOT_FOUND]: 404,
  [ErrorCodes.FILE_DELETE_FAILED]: 500,

  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCodes.INVALID_FORMAT]: 400,
  [ErrorCodes.INVALID_EMAIL]: 400,
  [ErrorCodes.INVALID_PHONE]: 400,
  [ErrorCodes.INVALID_ID_CARD]: 400,
  [ErrorCodes.INVALID_URL]: 400,
  [ErrorCodes.INVALID_DATE]: 400,

  [ErrorCodes.SYSTEM_ERROR]: 500,
  [ErrorCodes.SERVICE_UNAVAILABLE_ERROR]: 503,
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCodes.CIRCUIT_BREAKER_OPEN]: 503,
  [ErrorCodes.CACHE_ERROR]: 500,
  [ErrorCodes.QUEUE_ERROR]: 500,
  [ErrorCodes.MESSAGE_QUEUE_ERROR]: 500,
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 502,
};

/**
 * 错误码对应的错误消息映射
 * @description 将错误码映射到对应的错误消息
 */
export const ErrorCodeToMessage: Record<string, string> = {
  [ErrorCodes.SUCCESS]: '操作成功',
  [ErrorCodes.BAD_REQUEST]: '请求参数错误',
  [ErrorCodes.UNAUTHORIZED]: '未授权，请先登录',
  [ErrorCodes.FORBIDDEN]: '权限不足',
  [ErrorCodes.NOT_FOUND]: '资源不存在',
  [ErrorCodes.METHOD_NOT_ALLOWED]: '请求方法不允许',
  [ErrorCodes.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [ErrorCodes.BAD_GATEWAY]: '网关错误',
  [ErrorCodes.SERVICE_UNAVAILABLE]: '服务不可用',
  [ErrorCodes.GATEWAY_TIMEOUT]: '网关超时',

  [ErrorCodes.USER_NOT_FOUND]: '用户不存在',
  [ErrorCodes.USER_ALREADY_EXISTS]: '用户已存在',
  [ErrorCodes.INVALID_PASSWORD]: '密码错误',
  [ErrorCodes.TOKEN_EXPIRED]: 'Token已过期',
  [ErrorCodes.TOKEN_INVALID]: 'Token无效',
  [ErrorCodes.PERMISSION_DENIED]: '权限不足',
  [ErrorCodes.INSUFFICIENT_BALANCE]: '余额不足',
  [ErrorCodes.ORDER_NOT_FOUND]: '订单不存在',
  [ErrorCodes.PRODUCT_OUT_OF_STOCK]: '商品库存不足',
  [ErrorCodes.INVALID_OPERATION]: '非法操作',
  [ErrorCodes.RESOURCE_LOCKED]: '资源已被锁定',
  [ErrorCodes.DUPLICATE_OPERATION]: '重复操作',

  [ErrorCodes.DATABASE_ERROR]: '数据库错误',
  [ErrorCodes.DATABASE_CONNECTION_ERROR]: '数据库连接失败',
  [ErrorCodes.DUPLICATE_ENTRY]: '数据重复',
  [ErrorCodes.DATABASE_TIMEOUT]: '数据库超时',
  [ErrorCodes.DATABASE_CONSTRAINT_VIOLATION]: '数据库约束违反',

  [ErrorCodes.FILE_TOO_LARGE]: '文件过大',
  [ErrorCodes.FILE_TYPE_NOT_ALLOWED]: '文件类型不允许',
  [ErrorCodes.FILE_UPLOAD_FAILED]: '文件上传失败',
  [ErrorCodes.FILE_NOT_FOUND]: '文件不存在',
  [ErrorCodes.FILE_DELETE_FAILED]: '文件删除失败',

  [ErrorCodes.VALIDATION_ERROR]: '参数校验失败',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: '缺少必填字段',
  [ErrorCodes.INVALID_FORMAT]: '格式错误',
  [ErrorCodes.INVALID_EMAIL]: '邮箱格式错误',
  [ErrorCodes.INVALID_PHONE]: '手机号格式错误',
  [ErrorCodes.INVALID_ID_CARD]: '身份证号格式错误',
  [ErrorCodes.INVALID_URL]: 'URL格式错误',
  [ErrorCodes.INVALID_DATE]: '日期格式错误',

  [ErrorCodes.SYSTEM_ERROR]: '系统错误',
  [ErrorCodes.SERVICE_UNAVAILABLE_ERROR]: '服务不可用',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: '请求过于频繁',
  [ErrorCodes.CIRCUIT_BREAKER_OPEN]: '熔断器已打开',
  [ErrorCodes.CACHE_ERROR]: '缓存错误',
  [ErrorCodes.QUEUE_ERROR]: '队列错误',
  [ErrorCodes.MESSAGE_QUEUE_ERROR]: '消息队列错误',
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: '外部服务错误',
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

/**
 * 根据错误码获取对应的错误消息
 * @param {string} code - 错误码
 * @returns {string} 错误消息
 * @description 如果错误码不存在映射，默认返回'未知错误'
 * @example
 * const message = getErrorMessageByErrorCode(ErrorCodes.USER_NOT_FOUND); // '用户不存在'
 */
export function getErrorMessageByErrorCode(code: string): string {
  return ErrorCodeToMessage[code] || '未知错误';
}
