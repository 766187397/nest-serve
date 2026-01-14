import * as dotenv from 'dotenv';
// 根据环境加载对应的 .env 文件
const envFilePath = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
global.envFilePath = envFilePath;
dotenv.config({ path: envFilePath });

// 项目地址端口
let port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || 'localhost';
const IP = process.env.IP || '127.0.0.1';
let url = `${baseUrl}`;
global.url = url;

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './config/swagger';
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { LoggerService } from './module/logger/logger.service';
import { LoggerInterceptor } from './module/logger/logger.interceptor';
import { ApiResultInterceptor } from './common/interceptor/api-result.interceptor';
import { GlobalExceptionFilter } from './common/filter/global-exception.filter';
import { RouteNotFoundFilter } from './common/filter/route-not-found.filter';
import Knife4jDoc from 'node-knife4j-ui';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS配置
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // 配置 cookie-parser 中间件，支持签名的 cookie
  app.use(cookieParser());

  // 创建 Swagger 文档
  const document = SwaggerModule.createDocument(app, SwaggerConfig.swaggerOptions);
  // 将 Swagger 文档存储在全局对象中
  global.swaggerDocument = document;
  // 设置 Swagger UI 路由
  SwaggerModule.setup('swagger', app, document);

  // 配置 Knife4j 文档
  const knife4jDoc = new Knife4jDoc(document);
  const knife4jDocPath = knife4jDoc.getKnife4jUiPath();
  // 暴露静态文件服务
  app.use('/doc.html', knife4jDoc.serveExpress('/doc.html'), express.static(knife4jDocPath));

  // 获取底层 Express 实例
  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();

  // 添加获取 Swagger JSON 的接口
  expressApp.get('/json', (req, res) => {
    res.json(document);
  });

  // 添加下载 Swagger JSON 的接口
  expressApp.get('/download', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=swagger.json');
    res.send(JSON.stringify(document, null, 2));
  });

  // 启用全局校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 自动转换类型
      whitelist: true, // 只允许 DTO 中声明的字段 仅对DTO中的生效
      // forbidNonWhitelisted: true, // 如果有非法字段，抛出异常 仅对DTO中的生效
    })
  );

  const loggerService = app.get(LoggerService); // 从 DI 容器中获取 LoggerService
  // 全局过滤器
  app.useGlobalFilters(
    // 全局的异常过滤器
    new GlobalExceptionFilter(loggerService),
    // 404过滤器
    new RouteNotFoundFilter()
  );

  // 全局拦截器
  app.useGlobalInterceptors(
    // 使用 ClassSerializerInterceptor
    new ClassSerializerInterceptor(app.get(Reflector)),
    // 返回格式处理拦截器
    new ApiResultInterceptor(),
    // 自定义日志拦截器
    new LoggerInterceptor(loggerService)
  );

  run(app);
}
bootstrap();

/**
 * 运行 app 判断是否被占用，根据环境变量判断是否自动加1
 * @param app NestFactory.create nestjs创建的实例
 */
async function run(app: INestApplication<any>) {
  url = `${baseUrl}`;
  global.url = url;
  await app
    .listen(port, IP)
    .then((res) => {
      console.log(`当前环境为：${envFilePath}`);
      console.log(`当前端口为：${port}`);
      console.log(`server to ${url}`);
      console.log(`swagger to ${url}/swagger`);
      console.log(`knife4j to ${url}/doc.html`);
    })
    .catch((err) => {
      if (err.errno === -4091 && process.env.PORT_AUTO !== 'true') {
        console.log('请检查端口号是否被占用');
      } else if (err.errno === -4091 && process.env.PORT_AUTO === 'true') {
        port = Number(port) + 1;
        run(app);
      } else {
        console.log('err：', err);
      }
    });
}
