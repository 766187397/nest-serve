/**
 * HTTP状态码常量定义
 * @description 统一管理项目中使用的HTTP状态码，遵循HTTP/1.1规范
 * @see https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status
 */

/** 1xx 信息响应 */
export const HttpStatusCodes = {
  /** 100 Continue - 服务器已收到请求的初始部分，客户端应继续发送请求的其余部分 */
  CONTINUE: 100,
  /** 101 Switching Protocols - 服务器已理解客户端的请求，并将通过Upgrade消息头通知客户端采用不同的协议来完成这个请求 */
  SWITCHING_PROTOCOLS: 101,
  /** 102 Processing - 服务器已收到并正在处理请求，但无响应可用 */
  PROCESSING: 102,

  /** 2xx 成功响应 */
  /** 200 OK - 请求成功 */
  OK: 200,
  /** 201 Created - 请求成功并创建了新的资源 */
  CREATED: 201,
  /** 202 Accepted - 请求已接受，但尚未处理 */
  ACCEPTED: 202,
  /** 204 No Content - 服务器成功处理了请求，但没有返回任何内容 */
  NO_CONTENT: 204,
  /** 206 Partial Content - 服务器成功处理了部分GET请求 */
  PARTIAL_CONTENT: 206,

  /** 3xx 重定向响应 */
  /** 301 Moved Permanently - 请求的资源已被永久移动到新位置 */
  MOVED_PERMANENTLY: 301,
  /** 302 Found - 请求的资源暂时位于不同的URI */
  FOUND: 302,
  /** 304 Not Modified - 资源未修改，可以使用缓存版本 */
  NOT_MODIFIED: 304,

  /** 4xx 客户端错误响应 */
  /** 400 Bad Request - 服务器无法理解请求的格式 */
  BAD_REQUEST: 400,
  /** 401 Unauthorized - 请求要求身份验证 */
  UNAUTHORIZED: 401,
  /** 403 Forbidden - 服务器拒绝请求 */
  FORBIDDEN: 403,
  /** 404 Not Found - 服务器找不到请求的资源 */
  NOT_FOUND: 404,
  /** 405 Method Not Allowed - 请求方法不被允许 */
  METHOD_NOT_ALLOWED: 405,
  /** 409 Conflict - 请求与服务器当前状态冲突 */
  CONFLICT: 409,
  /** 413 Payload Too Large - 请求实体过大 */
  PAYLOAD_TOO_LARGE: 413,
  /** 415 Unsupported Media Type - 不支持的媒体类型 */
  UNSUPPORTED_MEDIA_TYPE: 415,
  /** 422 Unprocessable Entity - 请求格式正确，但由于语义错误无法处理 */
  UNPROCESSABLE_ENTITY: 422,
  /** 429 Too Many Requests - 请求过多 */
  TOO_MANY_REQUESTS: 429,

  /** 5xx 服务器错误响应 */
  /** 500 Internal Server Error - 服务器遇到意外情况 */
  INTERNAL_SERVER_ERROR: 500,
  /** 501 Not Implemented - 服务器不支持请求的功能 */
  NOT_IMPLEMENTED: 501,
  /** 502 Bad Gateway - 服务器作为网关或代理，从上游服务器收到无效响应 */
  BAD_GATEWAY: 502,
  /** 503 Service Unavailable - 服务器当前无法处理请求 */
  SERVICE_UNAVAILABLE: 503,
  /** 504 Gateway Timeout - 服务器作为网关或代理，未及时从上游服务器收到请求 */
  GATEWAY_TIMEOUT: 504,
};

/** 业务状态码常量定义 */
export const BusinessStatusCodes = {
  /** 操作成功 */
  SUCCESS: 200,
  /** 操作失败 */
  ERROR: 400,
  /** 未授权 */
  UNAUTHORIZED: 401,
  /** 禁止访问 */
  FORBIDDEN: 403,
  /** 资源不存在 */
  NOT_FOUND: 404,
  /** 参数错误 */
  PARAM_ERROR: 400,
  /** 验证失败 */
  VALIDATION_ERROR: 422,
  /** 服务器错误 */
  SERVER_ERROR: 500,
  /** 数据已存在 */
  DATA_EXISTS: 409,
  /** 数据不存在 */
  DATA_NOT_EXISTS: 404,
  /** 操作频繁 */
  TOO_MANY_REQUESTS: 429,
  /** 文件过大 */
  FILE_TOO_LARGE: 413,
  /** 不支持的文件类型 */
  UNSUPPORTED_FILE_TYPE: 415,
  /** 验证码错误 */
  CAPTCHA_ERROR: 400,
  /** 验证码过期 */
  CAPTCHA_EXPIRED: 400,
  /** Token过期 */
  TOKEN_EXPIRED: 401,
  /** Token无效 */
  TOKEN_INVALID: 401,
  /** 权限不足 */
  PERMISSION_DENIED: 403,
  /** 账号或密码错误 */
  ACCOUNT_OR_PASSWORD_ERROR: 400,
  /** 账号已存在 */
  ACCOUNT_EXISTS: 409,
  /** 账号不存在 */
  ACCOUNT_NOT_EXISTS: 404,
  /** 邮箱已存在 */
  EMAIL_EXISTS: 409,
  /** 邮箱不存在 */
  EMAIL_NOT_EXISTS: 404,
  /** 手机号已存在 */
  PHONE_EXISTS: 409,
  /** 手机号不存在 */
  PHONE_NOT_EXISTS: 404,
};

/** 状态码描述信息映射 */
export const HttpStatusMessages = {
  [HttpStatusCodes.OK]: "操作成功",
  [HttpStatusCodes.CREATED]: "创建成功",
  [HttpStatusCodes.ACCEPTED]: "请求已接受",
  [HttpStatusCodes.NO_CONTENT]: "操作成功",
  [HttpStatusCodes.BAD_REQUEST]: "参数错误",
  [HttpStatusCodes.UNAUTHORIZED]: "未授权，请重新登录",
  [HttpStatusCodes.FORBIDDEN]: "权限不足",
  [HttpStatusCodes.NOT_FOUND]: "请求资源不存在",
  [HttpStatusCodes.METHOD_NOT_ALLOWED]: "请求方法不被允许",
  [HttpStatusCodes.CONFLICT]: "数据已存在",
  [HttpStatusCodes.PAYLOAD_TOO_LARGE]: "请求实体过大",
  [HttpStatusCodes.UNSUPPORTED_MEDIA_TYPE]: "不支持的媒体类型",
  [HttpStatusCodes.UNPROCESSABLE_ENTITY]: "验证失败",
  [HttpStatusCodes.TOO_MANY_REQUESTS]: "请求过于频繁",
  [HttpStatusCodes.INTERNAL_SERVER_ERROR]: "服务器异常，请联系管理员",
  [HttpStatusCodes.NOT_IMPLEMENTED]: "功能未实现",
  [HttpStatusCodes.BAD_GATEWAY]: "网关错误",
  [HttpStatusCodes.SERVICE_UNAVAILABLE]: "服务不可用",
  [HttpStatusCodes.GATEWAY_TIMEOUT]: "网关超时",
};

/**
 * 获取状态码对应的描述信息
 * @param {number} statusCode - HTTP状态码
 * @returns {string} 状态码描述信息
 */
export function getHttpStatusMessage(statusCode: number): string {
  return HttpStatusMessages[statusCode] || "未知错误";
}
