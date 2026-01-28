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
  /** 00000 - 操作成功 */
  SUCCESS: '00000',
  /** 40000 - 请求参数错误 */
  BAD_REQUEST: '40000',
  /** 40100 - 未授权，请先登录 */
  UNAUTHORIZED: '40100',
  /** 40300 - 权限不足 */
  FORBIDDEN: '40300',
  /** 40400 - 资源不存在 */
  NOT_FOUND: '40400',
  /** 40500 - 请求方法不允许 */
  METHOD_NOT_ALLOWED: '40500',
  /** 50000 - 服务器内部错误 */
  INTERNAL_SERVER_ERROR: '50000',
  /** 50200 - 网关错误 */
  BAD_GATEWAY: '50200',
  /** 50300 - 服务不可用 */
  SERVICE_UNAVAILABLE: '50300',
  /** 50400 - 网关超时 */
  GATEWAY_TIMEOUT: '50400',

  // 业务错误码 6xxxx
  /** 60001 - 用户不存在 */
  USER_NOT_FOUND: '60001',
  /** 60002 - 用户已存在 */
  USER_ALREADY_EXISTS: '60002',
  /** 60003 - 密码错误 */
  INVALID_PASSWORD: '60003',
  /** 60004 - Token已过期 */
  TOKEN_EXPIRED: '60004',
  /** 60005 - Token无效 */
  TOKEN_INVALID: '60005',
  /** 60006 - 权限不足 */
  PERMISSION_DENIED: '60006',
  /** 60007 - 余额不足 */
  INSUFFICIENT_BALANCE: '60007',
  /** 60008 - 订单不存在 */
  ORDER_NOT_FOUND: '60008',
  /** 60009 - 商品库存不足 */
  PRODUCT_OUT_OF_STOCK: '60009',
  /** 60010 - 非法操作 */
  INVALID_OPERATION: '60010',
  /** 60011 - 资源已被锁定 */
  RESOURCE_LOCKED: '60011',
  /** 60012 - 重复操作 */
  DUPLICATE_OPERATION: '60012',

  // 数据库错误码 7xxxx
  /** 70001 - 数据库错误 */
  DATABASE_ERROR: '70001',
  /** 70002 - 数据库连接失败 */
  DATABASE_CONNECTION_ERROR: '70002',
  /** 70003 - 数据重复 */
  DUPLICATE_ENTRY: '70003',
  /** 70004 - 数据库超时 */
  DATABASE_TIMEOUT: '70004',
  /** 70005 - 数据库约束违反 */
  DATABASE_CONSTRAINT_VIOLATION: '70005',

  // 文件上传错误码 8xxxx
  /** 80001 - 文件过大 */
  FILE_TOO_LARGE: '80001',
  /** 80002 - 文件类型不允许 */
  FILE_TYPE_NOT_ALLOWED: '80002',
  /** 80003 - 文件上传失败 */
  FILE_UPLOAD_FAILED: '80003',
  /** 80004 - 文件不存在 */
  FILE_NOT_FOUND: '80004',
  /** 80005 - 文件删除失败 */
  FILE_DELETE_FAILED: '80005',

  // 参数校验错误码 9xxxx
  /** 90001 - 参数校验失败 */
  VALIDATION_ERROR: '90001',
  /** 90002 - 缺少必填字段 */
  MISSING_REQUIRED_FIELD: '90002',
  /** 90003 - 格式错误 */
  INVALID_FORMAT: '90003',
  /** 90004 - 邮箱格式错误 */
  INVALID_EMAIL: '90004',
  /** 90005 - 手机号格式错误 */
  INVALID_PHONE: '90005',
  /** 90006 - 身份证号格式错误 */
  INVALID_ID_CARD: '90006',
  /** 90007 - URL格式错误 */
  INVALID_URL: '90007',
  /** 90008 - 日期格式错误 */
  INVALID_DATE: '90008',

  // 系统错误码 5xxxx（扩展）
  /** 50001 - 系统错误 */
  SYSTEM_ERROR: '50001',
  /** 50002 - 服务不可用 */
  SERVICE_UNAVAILABLE_ERROR: '50002',
  /** 50003 - 请求过于频繁 */
  RATE_LIMIT_EXCEEDED: '50003',
  /** 50004 - 熔断器已打开 */
  CIRCUIT_BREAKER_OPEN: '50004',
  /** 50005 - 缓存错误 */
  CACHE_ERROR: '50005',
  /** 50006 - 队列错误 */
  QUEUE_ERROR: '50006',
  /** 50007 - 消息队列错误 */
  MESSAGE_QUEUE_ERROR: '50007',
  /** 50008 - 外部服务错误 */
  EXTERNAL_SERVICE_ERROR: '50008',
} as const;

/**
 * 错误码对应的HTTP状态码映射
 * @description 将错误码映射到对应的HTTP状态码
 */
export const ErrorCodeToHttpStatus: Record<string, number> = {
  /** 00000 - 操作成功，返回200 */
  [ErrorCodes.SUCCESS]: 200,
  /** 40000 - 请求参数错误，返回400 */
  [ErrorCodes.BAD_REQUEST]: 400,
  /** 40100 - 未授权，请先登录，返回401 */
  [ErrorCodes.UNAUTHORIZED]: 401,
  /** 40300 - 权限不足，返回403 */
  [ErrorCodes.FORBIDDEN]: 403,
  /** 40400 - 资源不存在，返回404 */
  [ErrorCodes.NOT_FOUND]: 404,
  /** 40500 - 请求方法不允许，返回405 */
  [ErrorCodes.METHOD_NOT_ALLOWED]: 405,
  /** 50000 - 服务器内部错误，返回500 */
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
  /** 50200 - 网关错误，返回502 */
  [ErrorCodes.BAD_GATEWAY]: 502,
  /** 50300 - 服务不可用，返回503 */
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  /** 50400 - 网关超时，返回504 */
  [ErrorCodes.GATEWAY_TIMEOUT]: 504,

  /** 60001 - 用户不存在，返回404 */
  [ErrorCodes.USER_NOT_FOUND]: 404,
  /** 60002 - 用户已存在，返回409 */
  [ErrorCodes.USER_ALREADY_EXISTS]: 409,
  /** 60003 - 密码错误，返回401 */
  [ErrorCodes.INVALID_PASSWORD]: 401,
  /** 60004 - Token已过期，返回401 */
  [ErrorCodes.TOKEN_EXPIRED]: 401,
  /** 60005 - Token无效，返回401 */
  [ErrorCodes.TOKEN_INVALID]: 401,
  /** 60006 - 权限不足，返回403 */
  [ErrorCodes.PERMISSION_DENIED]: 403,
  /** 60007 - 余额不足，返回400 */
  [ErrorCodes.INSUFFICIENT_BALANCE]: 400,
  /** 60008 - 订单不存在，返回404 */
  [ErrorCodes.ORDER_NOT_FOUND]: 404,
  /** 60009 - 商品库存不足，返回400 */
  [ErrorCodes.PRODUCT_OUT_OF_STOCK]: 400,
  /** 60010 - 非法操作，返回400 */
  [ErrorCodes.INVALID_OPERATION]: 400,
  /** 60011 - 资源已被锁定，返回423 */
  [ErrorCodes.RESOURCE_LOCKED]: 423,
  /** 60012 - 重复操作，返回409 */
  [ErrorCodes.DUPLICATE_OPERATION]: 409,

  /** 70001 - 数据库错误，返回500 */
  [ErrorCodes.DATABASE_ERROR]: 500,
  /** 70002 - 数据库连接失败，返回503 */
  [ErrorCodes.DATABASE_CONNECTION_ERROR]: 503,
  /** 70003 - 数据重复，返回409 */
  [ErrorCodes.DUPLICATE_ENTRY]: 409,
  /** 70004 - 数据库超时，返回504 */
  [ErrorCodes.DATABASE_TIMEOUT]: 504,
  /** 70005 - 数据库约束违反，返回400 */
  [ErrorCodes.DATABASE_CONSTRAINT_VIOLATION]: 400,

  /** 80001 - 文件过大，返回413 */
  [ErrorCodes.FILE_TOO_LARGE]: 413,
  /** 80002 - 文件类型不允许，返回415 */
  [ErrorCodes.FILE_TYPE_NOT_ALLOWED]: 415,
  /** 80003 - 文件上传失败，返回500 */
  [ErrorCodes.FILE_UPLOAD_FAILED]: 500,
  /** 80004 - 文件不存在，返回404 */
  [ErrorCodes.FILE_NOT_FOUND]: 404,
  /** 80005 - 文件删除失败，返回500 */
  [ErrorCodes.FILE_DELETE_FAILED]: 500,

  /** 90001 - 参数校验失败，返回400 */
  [ErrorCodes.VALIDATION_ERROR]: 400,
  /** 90002 - 缺少必填字段，返回400 */
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  /** 90003 - 格式错误，返回400 */
  [ErrorCodes.INVALID_FORMAT]: 400,
  /** 90004 - 邮箱格式错误，返回400 */
  [ErrorCodes.INVALID_EMAIL]: 400,
  /** 90005 - 手机号格式错误，返回400 */
  [ErrorCodes.INVALID_PHONE]: 400,
  /** 90006 - 身份证号格式错误，返回400 */
  [ErrorCodes.INVALID_ID_CARD]: 400,
  /** 90007 - URL格式错误，返回400 */
  [ErrorCodes.INVALID_URL]: 400,
  /** 90008 - 日期格式错误，返回400 */
  [ErrorCodes.INVALID_DATE]: 400,

  /** 50001 - 系统错误，返回500 */
  [ErrorCodes.SYSTEM_ERROR]: 500,
  /** 50002 - 服务不可用，返回503 */
  [ErrorCodes.SERVICE_UNAVAILABLE_ERROR]: 503,
  /** 50003 - 请求过于频繁，返回429 */
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  /** 50004 - 熔断器已打开，返回503 */
  [ErrorCodes.CIRCUIT_BREAKER_OPEN]: 503,
  /** 50005 - 缓存错误，返回500 */
  [ErrorCodes.CACHE_ERROR]: 500,
  /** 50006 - 队列错误，返回500 */
  [ErrorCodes.QUEUE_ERROR]: 500,
  /** 50007 - 消息队列错误，返回500 */
  [ErrorCodes.MESSAGE_QUEUE_ERROR]: 500,
  /** 50008 - 外部服务错误，返回502 */
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 502,
};

/**
 * 错误码对应的错误消息映射
 * @description 将错误码映射到对应的错误消息
 */
export const ErrorCodeToMessage: Record<string, string> = {
  /** 00000 - 操作成功 */
  [ErrorCodes.SUCCESS]: '操作成功',
  /** 40000 - 请求参数错误 */
  [ErrorCodes.BAD_REQUEST]: '请求参数错误',
  /** 40100 - 未授权，请先登录 */
  [ErrorCodes.UNAUTHORIZED]: '未授权，请先登录',
  /** 40300 - 权限不足 */
  [ErrorCodes.FORBIDDEN]: '权限不足',
  /** 40400 - 资源不存在 */
  [ErrorCodes.NOT_FOUND]: '资源不存在',
  /** 40500 - 请求方法不允许 */
  [ErrorCodes.METHOD_NOT_ALLOWED]: '请求方法不允许',
  /** 50000 - 服务器内部错误 */
  [ErrorCodes.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  /** 50200 - 网关错误 */
  [ErrorCodes.BAD_GATEWAY]: '网关错误',
  /** 50300 - 服务不可用 */
  [ErrorCodes.SERVICE_UNAVAILABLE]: '服务不可用',
  /** 50400 - 网关超时 */
  [ErrorCodes.GATEWAY_TIMEOUT]: '网关超时',

  /** 60001 - 用户不存在 */
  [ErrorCodes.USER_NOT_FOUND]: '用户不存在',
  /** 60002 - 用户已存在 */
  [ErrorCodes.USER_ALREADY_EXISTS]: '用户已存在',
  /** 60003 - 密码错误 */
  [ErrorCodes.INVALID_PASSWORD]: '密码错误',
  /** 60004 - Token已过期 */
  [ErrorCodes.TOKEN_EXPIRED]: 'Token已过期',
  /** 60005 - Token无效 */
  [ErrorCodes.TOKEN_INVALID]: 'Token无效',
  /** 60006 - 权限不足 */
  [ErrorCodes.PERMISSION_DENIED]: '权限不足',
  /** 60007 - 余额不足 */
  [ErrorCodes.INSUFFICIENT_BALANCE]: '余额不足',
  /** 60008 - 订单不存在 */
  [ErrorCodes.ORDER_NOT_FOUND]: '订单不存在',
  /** 60009 - 商品库存不足 */
  [ErrorCodes.PRODUCT_OUT_OF_STOCK]: '商品库存不足',
  /** 60010 - 非法操作 */
  [ErrorCodes.INVALID_OPERATION]: '非法操作',
  /** 60011 - 资源已被锁定 */
  [ErrorCodes.RESOURCE_LOCKED]: '资源已被锁定',
  /** 60012 - 重复操作 */
  [ErrorCodes.DUPLICATE_OPERATION]: '重复操作',

  /** 70001 - 数据库错误 */
  [ErrorCodes.DATABASE_ERROR]: '数据库错误',
  /** 70002 - 数据库连接失败 */
  [ErrorCodes.DATABASE_CONNECTION_ERROR]: '数据库连接失败',
  /** 70003 - 数据重复 */
  [ErrorCodes.DUPLICATE_ENTRY]: '数据重复',
  /** 70004 - 数据库超时 */
  [ErrorCodes.DATABASE_TIMEOUT]: '数据库超时',
  /** 70005 - 数据库约束违反 */
  [ErrorCodes.DATABASE_CONSTRAINT_VIOLATION]: '数据库约束违反',

  /** 80001 - 文件过大 */
  [ErrorCodes.FILE_TOO_LARGE]: '文件过大',
  /** 80002 - 文件类型不允许 */
  [ErrorCodes.FILE_TYPE_NOT_ALLOWED]: '文件类型不允许',
  /** 80003 - 文件上传失败 */
  [ErrorCodes.FILE_UPLOAD_FAILED]: '文件上传失败',
  /** 80004 - 文件不存在 */
  [ErrorCodes.FILE_NOT_FOUND]: '文件不存在',
  /** 80005 - 文件删除失败 */
  [ErrorCodes.FILE_DELETE_FAILED]: '文件删除失败',

  /** 90001 - 参数校验失败 */
  [ErrorCodes.VALIDATION_ERROR]: '参数校验失败',
  /** 90002 - 缺少必填字段 */
  [ErrorCodes.MISSING_REQUIRED_FIELD]: '缺少必填字段',
  /** 90003 - 格式错误 */
  [ErrorCodes.INVALID_FORMAT]: '格式错误',
  /** 90004 - 邮箱格式错误 */
  [ErrorCodes.INVALID_EMAIL]: '邮箱格式错误',
  /** 90005 - 手机号格式错误 */
  [ErrorCodes.INVALID_PHONE]: '手机号格式错误',
  /** 90006 - 身份证号格式错误 */
  [ErrorCodes.INVALID_ID_CARD]: '身份证号格式错误',
  /** 90007 - URL格式错误 */
  [ErrorCodes.INVALID_URL]: 'URL格式错误',
  /** 90008 - 日期格式错误 */
  [ErrorCodes.INVALID_DATE]: '日期格式错误',

  /** 50001 - 系统错误 */
  [ErrorCodes.SYSTEM_ERROR]: '系统错误',
  /** 50002 - 服务不可用 */
  [ErrorCodes.SERVICE_UNAVAILABLE_ERROR]: '服务不可用',
  /** 50003 - 请求过于频繁 */
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: '请求过于频繁',
  /** 50004 - 熔断器已打开 */
  [ErrorCodes.CIRCUIT_BREAKER_OPEN]: '熔断器已打开',
  /** 50005 - 缓存错误 */
  [ErrorCodes.CACHE_ERROR]: '缓存错误',
  /** 50006 - 队列错误 */
  [ErrorCodes.QUEUE_ERROR]: '队列错误',
  /** 50007 - 消息队列错误 */
  [ErrorCodes.MESSAGE_QUEUE_ERROR]: '消息队列错误',
  /** 50008 - 外部服务错误 */
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
