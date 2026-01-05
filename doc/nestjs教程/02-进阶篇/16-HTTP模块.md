# HTTP模块

HTTP模块是NestJS中用于处理HTTP请求的核心模块，提供了强大的HTTP客户端和服务器功能。通过HTTP模块，可以轻松实现RESTful API、HTTP客户端请求、文件上传、WebSockets等功能。NestJS的HTTP模块基于Express，同时提供了更加高级和灵活的API。

## 1. HTTP模块的概念

### 1.1 什么是HTTP模块

HTTP模块是NestJS框架中的一个核心模块，用于处理HTTP请求和响应。它提供了以下功能：

- **HTTP服务器**：处理客户端的HTTP请求
- **HTTP客户端**：发送HTTP请求到其他服务
- **中间件**：处理HTTP请求的中间件
- **拦截器**：拦截HTTP请求和响应
- **过滤器**：处理HTTP异常
- **管道**：验证和转换HTTP请求数据
- **守卫**：处理HTTP请求的授权

### 1.2 HTTP模块的重要性

- **核心功能**：HTTP模块是NestJS应用的核心，处理所有的HTTP请求
- **灵活配置**：提供了丰富的配置选项，可以根据需求进行定制
- **高级功能**：支持WebSockets、文件上传、CORS等高级功能
- **类型安全**：使用TypeScript提供类型安全的API
- **易于扩展**：支持自定义中间件、拦截器、过滤器等
- **与其他模块集成**：可以与其他NestJS模块无缝集成

### 1.3 HTTP模块的组成

- **@nestjs/common**：提供了核心的HTTP功能，如控制器、路由、装饰器等
- **@nestjs/core**：提供了应用程序的核心功能，如应用程序的创建、启动等
- **@nestjs/platform-express**：基于Express的HTTP平台适配器
- **@nestjs/platform-fastify**：基于Fastify的HTTP平台适配器
- **@nestjs/axios**：基于Axios的HTTP客户端

## 2. NestJS中的HTTP模块

NestJS的HTTP模块提供了以下核心功能：

### 2.1 HTTP服务器

NestJS的HTTP服务器基于Express或Fastify，可以通过以下方式创建：

#### 2.1.1 基本使用

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建HTTP服务器，默认使用Express
  const app = await NestFactory.create(AppModule);
  
  // 启动服务器
  await app.listen(3000);
  
  console.log('应用程序已启动，监听端口 3000');
}
bootstrap();
```

#### 2.1.2 使用Fastify

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  // 创建HTTP服务器，使用Fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  
  // 启动服务器
  await app.listen(3000);
  
  console.log('应用程序已启动，监听端口 3000');
}
bootstrap();
```

### 2.2 HTTP客户端

NestJS的HTTP客户端基于Axios，可以通过以下方式使用：

#### 2.2.1 安装依赖

```bash
npm install @nestjs/axios axios
```

#### 2.2.2 配置模块

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // 配置HTTP客户端模块
    HttpModule.register({
      timeout: 5000, // 超时时间，单位毫秒
      maxRedirects: 5, // 最大重定向次数
      baseURL: 'https://api.example.com', // 基础URL
    }),
  ],
})
export class AppModule {}
```

#### 2.2.3 基本使用

```typescript
// src/modules/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  constructor(private readonly httpService: HttpService) {}
  
  async getUser(id: number) {
    // 发送GET请求
    const response = await lastValueFrom(
      this.httpService.get(`/users/${id}`)
    );
    
    return response.data;
  }
  
  async createUser(user: { name: string; email: string }) {
    // 发送POST请求
    const response = await lastValueFrom(
      this.httpService.post('/users', user)
    );
    
    return response.data;
  }
  
  async updateUser(id: number, user: { name: string; email: string }) {
    // 发送PUT请求
    const response = await lastValueFrom(
      this.httpService.put(`/users/${id}`, user)
    );
    
    return response.data;
  }
  
  async deleteUser(id: number) {
    // 发送DELETE请求
    const response = await lastValueFrom(
      this.httpService.delete(`/users/${id}`)
    );
    
    return response.data;
  }
}
```

### 2.3 HTTP拦截器

HTTP拦截器可以拦截HTTP请求和响应，用于添加认证头、日志记录、错误处理等。

#### 2.3.1 创建拦截器

```typescript
// src/interceptors/http.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 获取请求对象
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // 记录请求开始时间
    const startTime = Date.now();
    
    // 打印请求信息
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
    
    // 处理请求
    return next.handle().pipe(
      // 记录响应信息
      tap(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        console.log(`[${new Date().toISOString()}] ${request.method} ${request.url} ${response.statusCode} ${responseTime}ms`);
      })
    );
  }
}
```

#### 2.3.2 注册拦截器

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpInterceptor } from './interceptors/http.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 注册全局拦截器
  app.useGlobalInterceptors(new HttpInterceptor());
  
  await app.listen(3000);
}
bootstrap();
```

### 2.4 HTTP过滤器

HTTP过滤器用于处理HTTP异常，可以自定义异常的响应格式。

#### 2.4.1 创建过滤器

```typescript
// src/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // 获取请求和响应对象
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // 获取异常状态码和消息
    const status = exception.getStatus();
    const message = exception.getResponse();
    
    // 自定义响应格式
    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: message,
      });
  }
}
```

#### 2.4.2 注册过滤器

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 注册全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  await app.listen(3000);
}
bootstrap();
```

## 3. HTTP客户端高级功能

### 3.1 配置HTTP客户端

HTTP客户端支持多种配置选项，可以根据需求进行定制：

```typescript
// src/modules/http/http.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // 使用配置服务配置HTTP客户端
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('API_BASE_URL'),
        timeout: configService.get<number>('HTTP_TIMEOUT', 5000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${configService.get<string>('API_TOKEN')}`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [HttpModule],
})
export class HttpClientModule {}
```

### 3.2 HTTP客户端拦截器

HTTP客户端拦截器可以拦截HTTP请求和响应，用于添加认证头、日志记录、错误处理等。

#### 3.2.1 创建拦截器

```typescript
// src/interceptors/http-client.interceptor.ts
import { Injectable } from '@nestjs/common';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpClientInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 记录请求信息
    console.log(`[HTTP客户端] ${request.method} ${request.url}`);
    
    // 修改请求，添加认证头
    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${localStorage.getItem('token')}`),
    });
    
    // 处理请求
    return next.handle(authReq).pipe(
      // 记录响应信息
      tap(
        (event) => {
          if (event.type === 4) { // HttpResponse
            console.log(`[HTTP客户端] ${request.method} ${request.url} ${event.status}`);
          }
        },
        (error) => {
          console.error(`[HTTP客户端] ${request.method} ${request.url} ${error.status} ${error.message}`);
        }
      )
    );
  }
}
```

### 3.3 HTTP客户端异常处理

HTTP客户端异常处理可以通过以下方式实现：

```typescript
// src/modules/user/user.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UserService {
  constructor(private readonly httpService: HttpService) {}
  
  async getUser(id: number) {
    try {
      // 发送GET请求，处理异常
      const response = await lastValueFrom(
        this.httpService.get(`/users/${id}`).pipe(
          catchError((error) => {
            // 自定义异常处理
            if (error.response?.status === 404) {
              throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
            }
            throw new HttpException('请求失败', HttpStatus.INTERNAL_SERVER_ERROR);
          })
        )
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
```

## 4. HTTP服务器高级功能

### 4.1 CORS配置

CORS（跨域资源共享）配置可以通过以下方式实现：

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 配置CORS
  app.enableCors({
    origin: '*', // 允许所有来源
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 允许的HTTP方法
    credentials: true, // 允许发送凭证
    allowedHeaders: 'Content-Type, Accept, Authorization', // 允许的请求头
  });
  
  await app.listen(3000);
}
bootstrap();
```

### 4.2 全局前缀

全局前缀可以为所有路由添加一个统一的前缀：

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 添加全局前缀
  app.setGlobalPrefix('api');
  
  await app.listen(3000);
}
bootstrap();
```

### 4.3 中间件

中间件可以处理HTTP请求，可以通过以下方式创建和注册：

#### 4.3.1 创建中间件

```typescript
// src/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 记录请求信息
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // 处理请求
    next();
  }
}
```

#### 4.3.2 注册中间件

```typescript
// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 注册中间件，应用到所有路由
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

## 5. 完整示例

### 5.1 HTTP客户端示例

```typescript
// src/modules/http/http.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://jsonplaceholder.typicode.com',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ],
  exports: [HttpModule],
})
export class HttpClientModule {}
```

```typescript
// src/modules/post/post.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Post } from './post.interface';

@Injectable()
export class PostService {
  constructor(private readonly httpService: HttpService) {}
  
  async getPosts(): Promise<Post[]> {
    const response = await lastValueFrom(
      this.httpService.get('/posts')
    );
    return response.data;
  }
  
  async getPostById(id: number): Promise<Post> {
    const response = await lastValueFrom(
      this.httpService.get(`/posts/${id}`)
    );
    return response.data;
  }
  
  async createPost(post: Omit<Post, 'id'>): Promise<Post> {
    const response = await lastValueFrom(
      this.httpService.post('/posts', post)
    );
    return response.data;
  }
  
  async updatePost(id: number, post: Partial<Post>): Promise<Post> {
    const response = await lastValueFrom(
      this.httpService.put(`/posts/${id}`, post)
    );
    return response.data;
  }
  
  async deletePost(id: number): Promise<void> {
    await lastValueFrom(
      this.httpService.delete(`/posts/${id}`)
    );
  }
}
```

```typescript
// src/modules/post/post.interface.ts
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}
```

```typescript
// src/modules/post/post.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostInterface } from './post.interface';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}
  
  @Get()
  async getPosts() {
    return this.postService.getPosts();
  }
  
  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return this.postService.getPostById(Number(id));
  }
  
  @Post()
  async createPost(@Body() post: Omit<PostInterface, 'id'>) {
    return this.postService.createPost(post);
  }
  
  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() post: Partial<PostInterface>) {
    return this.postService.updatePost(Number(id), post);
  }
  
  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.postService.deletePost(Number(id));
  }
}
```

```typescript
// src/modules/post/post.module.ts
import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { HttpClientModule } from '../http/http.module';

@Module({
  imports: [HttpClientModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
```

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { PostModule } from './modules/post/post.module';

@Module({
  imports: [PostModule],
})
export class AppModule {}
```

## 6. 常见问题与解决方案

### 6.1 HTTP客户端请求失败

**问题**：HTTP客户端请求失败，返回404或500错误

**解决方案**：
- 检查请求的URL是否正确
- 检查请求的方法是否正确
- 检查请求的headers是否正确
- 检查请求的body是否正确
- 检查是否有网络问题
- 检查目标服务是否正常运行

### 6.2 HTTP服务器无法启动

**问题**：HTTP服务器无法启动，提示端口被占用

**解决方案**：
- 检查端口是否被其他进程占用
- 更改服务器的端口
- 关闭占用端口的进程

### 6.3 CORS配置不生效

**问题**：CORS配置后，跨域请求仍然失败

**解决方案**：
- 检查CORS配置是否正确
- 检查是否有其他中间件覆盖了CORS配置
- 检查浏览器是否支持CORS
- 检查请求是否包含凭证

### 6.4 拦截器不执行

**问题**：注册了拦截器，但拦截器不执行

**解决方案**：
- 检查拦截器是否被正确注册
- 检查拦截器的作用域是否正确
- 检查是否有其他拦截器覆盖了当前拦截器
- 检查请求是否符合拦截器的条件

## 7. 总结

HTTP模块是NestJS应用的核心，处理所有的HTTP请求和响应。通过HTTP模块，可以轻松实现RESTful API、HTTP客户端请求、文件上传、WebSockets等功能。

在实际开发中，我们应该遵循以下最佳实践：

- **合理配置HTTP客户端**：根据需求配置HTTP客户端的超时时间、基础URL等
- **使用拦截器处理通用逻辑**：使用拦截器处理认证、日志记录、错误处理等通用逻辑
- **使用过滤器自定义异常响应**：使用过滤器自定义异常的响应格式，提高API的一致性
- **配置CORS**：根据需求配置CORS，允许跨域请求
- **使用中间件处理请求**：使用中间件处理请求的前置和后置逻辑
- **监控HTTP请求**：监控HTTP请求的响应时间、状态码等，便于调试和优化

通过合理使用HTTP模块，可以提高应用的性能、可靠性和可维护性，满足各种复杂的业务需求。