/** jwt白名单 */
export class JWTWhiteList {
  // 前缀匹配
  static whiteListStartsWith: string[] = [
    "/doc.html", // knife4j 前台地址
    "/api-docs", // knife4j 分组接口文档
    "/webjars", // knife4j 静态资源
    "/swagger", // swagger 接口文档地址
    "/api/v1/large/files", // 大文件上传
    "/api/v1/large/tempFile", // 大文件上传取消
  ];
  // 全匹配
  static whiteListExact: string[] = [
    "/favicon.ico", // 网站图标
    "/v3/api-docs/swagger-config", // knife4j 请求配置
    "/api/v1/admin/users/logIn", // 账号密码登录接口
    "/api/v1/admin/users/logIn/setCookie", // 账号密码登录接口，设置cookie
    "/api/v1/admin/users/logIn/verificationCode", // 邮箱验证码登录接口
    "/api/v1/admin/users/refresh/token", // 刷新token
    "/api/v1/upload/file", // 文件上传接口
    "/api/v1/admin/email/send/email", // 邮件发送接口
    "/api/v1/admin/users/captcha", // 验证码接口
  ];
}

/** logger 白名单 */
export class LoggerWhiteList {
  // 前缀匹配
  static whiteListStartsWith: string[] = [
    "/doc.html", // knife4j 前台地址
    "/api-docs", // knife4j 分组接口文档
    "/webjars", // knife4j 静态资源
    "/swagger", // swagger 接口文档地址
    "/api/v1/large/files", // 大文件上传
    "/api/v1/admin/logger/page", // 日志分页查询
  ];
  // 全匹配
  static whiteListExact: string[] = [
    "/favicon.ico", // 网站图标
    "/v3/api-docs/swagger-config", // knife4j 请求配置
  ];
}

/** 返回处理白名单 */
export class ResultWhiteList {
  // 前缀匹配
  static whiteListStartsWith: string[] = ["/api/v1/admin/logger"];
  // 全匹配
  static whiteListExact: string[] = [];
}
