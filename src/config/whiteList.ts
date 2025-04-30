export class WhiteList {
  // 前缀匹配
  static whiteListStartsWith: string[] = [
    "/doc.html", // knife4j 前台地址
    "/api-docs", // knife4j 分组接口文档
    "/webjars", // knife4j 静态资源
    "/swagger", // swagger 接口文档地址
    "/api/v1/large/files",
  ];
  // 全匹配
  static whiteListExact: string[] = [
    "/favicon.ico", // 网站图标
    "/v3/api-docs/swagger-config", // knife4j 请求配置
    "/api/v1/admin/users/logIn", // 登录接口
    "/api/v1/admin/users/logIn/setCookie", // 登录接口
    "/api/v1/admin/users/refresh/token", // 登录接口
  ];
}
