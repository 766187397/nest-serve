export class WhiteList {
  // 前缀匹配
  static whiteListStartsWith = [
    "/api/api-docs", // knife4j 分组接口文档
    "/api/webjars", // knife4j 静态资源
    "/api/doc", // knife4j 接口文档地址
    "/swagger", // swagger 接口文档地址
    "/uploads", // 文件访问地址
    "/api/large", // 大文件上传地址
  ];
  // 全匹配
  static whiteListExact = [
    "/api/upload/file", // 文件上传
    "/favicon.ico", // 前端静态文件
    "/api/v3/api-docs/swagger-config", // knife4j 接口文档配置
    "/api/json", // 获取 Swagger JSON
    "/api/download", // 下载接口文档
    "/api/users/login", // 登录接口
    "/api/users/login/setCookie", // 登录设置 cookie
    "/api/users/register", // 注册接口
  ];
}
