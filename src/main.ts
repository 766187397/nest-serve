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
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './config/swagger';
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { LoggerService } from './modules/logger/logger.service';
import { LoggerInterceptor } from './modules/logger/logger.interceptor';
import { ApiResultInterceptor } from './common/interceptors/api-result.interceptor';
import { PerformanceMonitorInterceptor } from './common/interceptors/performance-monitor.interceptor';
import { PrometheusService } from './modules/performance-monitor/prometheus.service';
import { TraceService } from './modules/performance-monitor/trace.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RouteNotFoundFilter } from './common/filters/route-not-found.filter';
import { ConfigService } from '@nestjs/config';
import Knife4jDoc from 'node-knife4j-ui';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS配置
  const corsOriginEnv = process.env.CORS_ORIGIN || '';
  const isAllowAll = corsOriginEnv === '*' || corsOriginEnv.includes('*');

  app.enableCors({
    origin: isAllowAll ? true : corsOriginEnv.split(',').filter(Boolean),
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
  // 处理根路径的 /services.json 请求（Knife4j 前端固定请求此路径）
  app.use(knife4jDoc.serveRootServices('/doc.html'));

  // 根路径重定向到 Knife4j 文档
  app.use('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path === '/') {
      return res.redirect('/doc.html');
    }
    next();
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
  const configService = app.get(ConfigService); // 从 DI 容器中获取 ConfigService
  const prometheusService = app.get(PrometheusService); // 从 DI 容器中获取 PrometheusService
  const traceService = app.get(TraceService); // 从 DI 容器中获取 TraceService
  // 全局过滤器
  app.useGlobalFilters(
    // 全局的异常过滤器
    new GlobalExceptionFilter(loggerService, configService),
    // 404过滤器
    new RouteNotFoundFilter()
  );

  // 全局拦截器
  app.useGlobalInterceptors(
    // 使用 ClassSerializerInterceptor
    new ClassSerializerInterceptor(app.get(Reflector)),
    // 性能监控拦截器
    new PerformanceMonitorInterceptor(prometheusService, traceService),
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
async function run(app: INestApplication) {
  const logger = new Logger('Bootstrap');
  url = `${baseUrl}`;
  global.url = url;
  await app
    .listen(port, IP)
    .then((res) => {
      logger.log(`当前环境为：${envFilePath}`);
      logger.log(`当前端口为：${port}`);
      logger.log(`server to ${url}`);
      logger.log(`swagger to ${url}/swagger`);
      logger.log(`knife4j to ${url}/doc.html`);
    })
    .catch((err) => {
      if (err.errno === -4091 && process.env.PORT_AUTO !== 'true') {
        logger.error('请检查端口号是否被占用');
      } else if (err.errno === -4091 && process.env.PORT_AUTO === 'true') {
        port = Number(port) + 1;
        run(app);
      } else {
        logger.error('err：', err);
      }
    });
}
