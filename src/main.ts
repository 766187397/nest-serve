import * as dotenv from "dotenv";
// 根据环境加载对应的 .env 文件
const envFilePath = `.env.${process.env.NODE_ENV || "dev"}`;
global.envFilePath = envFilePath;
dotenv.config({ path: envFilePath });

// 项目地址端口
let port = process.env.PORT || 3000;
let host = process.env.HOST || "localhost";
let url = `http://${host}:${port}`;
global.url = url;

import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule } from "@nestjs/swagger";
import { SwaggerConfig } from "./config/swagger";
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { createAuthMiddleware } from "./module/auth/auth.middleware";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "./module/users/users.service";
import { ClassValidatorExceptionFilter } from "./common/filter/class-validator-filter";
import { ErrorFilter } from "./common/filter/multer";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 允许所有不同源的客户端请求
  // app.enableCors({
  //   origin: "http://example.com", // 只允许来自 http://example.com 的请求
  //   methods: ["GET", "POST"], // 只允许 GET 和 POST 请求
  //   credentials: true, // 允许携带凭证信息
  // });

  // 配置 cookie-parser 中间件，支持签名的 cookie
  app.use(cookieParser());
  // 注册全局守卫
  const jwtService = app.get(JwtService); // 从 DI 容器中获取 JwtService
  const usersService = app.get(UsersService); // 获取用户的服务方便查询最新信息
  app.use(await createAuthMiddleware(jwtService, usersService));

  // 创建 Swagger 文档
  const document = SwaggerModule.createDocument(app, SwaggerConfig.swaggerOptions);
  // 将 Swagger 文档存储在全局对象中
  global.swaggerDocument = document;
  // 设置 Swagger UI 路由
  SwaggerModule.setup("swagger", app, document);

  // 启用全局校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 自动转换类型
      whitelist: true, // 只允许 DTO 中声明的字段 仅对DTO中的生效
      forbidNonWhitelisted: true, // 如果有非法字段，抛出异常 仅对DTO中的生效
    })
  );

  // 使用 ClassSerializerInterceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  // 表单校验过滤器
  app.useGlobalFilters(new ClassValidatorExceptionFilter());
  // 文件上传过滤器
  app.useGlobalFilters(new ErrorFilter());

  run(app);
  // await app.listen(port).then((res) => {
  //   console.log(`当前环境为：${envFilePath}`);
  //   console.log(`server to ${url}`);
  //   console.log(`swagger to ${url}/swagger`);
  //   console.log(`knife4j to ${url}/doc.html`);
  // });
}
bootstrap();

/**
 * 运行 app 判断是否被占用，根据环境变量判断是否自动加1
 * @param app NestFactory.create nestjs创建的实例
 * @param port 端口号
 */
async function run(app: INestApplication<any>, port?: number | string) {
  port = port || process.env.PORT || 3000;
  host = process.env.HOST || "localhost";
  url = `http://${host}:${port}`;
  global.url = url;
  await app
    .listen(port)
    .then((res) => {
      console.log(`当前环境为：${envFilePath}`);
      console.log(`server to ${url}`);
      console.log(`swagger to ${url}/swagger`);
      console.log(`knife4j to ${url}/doc.html`);
    })
    .catch((err) => {
      if (err.errno === -4091 && process.env.PORT_AUTO !== "true") {
        console.log("请检查端口号是否被占用");
      } else if (err.errno === -4091 && process.env.PORT_AUTO === "true") {
        port = Number(port) + 1;
        run(app, port);
      }
    });
}
