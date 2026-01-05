# NestJS 简介

## 什么是 NestJS？

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的渐进式框架。它使用 TypeScript 构建，并结合了 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数式响应式编程）的元素。

NestJS 提供了一个分层架构，允许开发者使用与 Angular 类似的方式构建应用程序，同时保持了 Node.js 生态系统的灵活性和强大功能。

## 为什么选择 NestJS？

### 1. 模块化架构

NestJS 采用模块化架构设计，将应用程序划分为多个模块，每个模块负责特定的功能。这种设计使得应用程序更加易于维护、测试和扩展。

```typescript
// 示例：一个简单的 NestJS 模块
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController], // 声明该模块的控制器
  providers: [UserService], // 声明该模块的服务
  exports: [UserService], // 导出服务，供其他模块使用
})
export class UserModule {} // 导出模块
```

### 2. TypeScript 支持

NestJS 完全支持 TypeScript，提供了类型安全和更好的开发体验。TypeScript 可以帮助开发者在编译时发现错误，减少运行时错误，提高代码质量。

```typescript
// 示例：使用 TypeScript 定义的接口
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// 示例：使用 TypeScript 的类和装饰器
@Injectable()
export class UserService {
  private users: User[] = [];

  // 使用 TypeScript 的类型注解
  create(user: Omit<User, 'id'>): User {
    const newUser: User = {
      id: this.users.length + 1,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }
}
```

### 3. 依赖注入

NestJS 内置了依赖注入容器，使得组件之间的依赖关系更加清晰，便于测试和维护。依赖注入可以帮助开发者实现松耦合的设计，提高代码的可重用性。

```typescript
// 示例：依赖注入的使用
import { Injectable } from '@nestjs/common';

@Injectable() // 标记该类为可注入的服务
export class UserService {
  // 服务的实现
}

// 在控制器中注入服务
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UserController {
  // 通过构造函数注入 UserService
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
```

### 4. 中间件、管道、过滤器和拦截器

NestJS 提供了丰富的中间件、管道、过滤器和拦截器机制，用于处理请求、响应、异常和日志等。这些机制可以帮助开发者实现横切关注点的分离，提高代码的可维护性。

#### 中间件（Middleware）

中间件是在请求处理管道中执行的函数，可以访问请求和响应对象，并可以调用下一个中间件函数。

```typescript
// 示例：自定义中间件
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next(); // 调用下一个中间件
  }
}
```

#### 管道（Pipes）

管道用于转换和验证数据，可以在控制器处理请求之前或之后执行。

```typescript
// 示例：自定义管道
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('Validation failed: No data provided');
    }
    // 数据验证逻辑
    return value;
  }
}
```

#### 过滤器（Filters）

过滤器用于处理异常，可以捕获控制器、服务或管道中抛出的异常，并返回适当的响应。

```typescript
// 示例：自定义异常过滤器
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException) // 捕获 HttpException 类型的异常
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      });
  }
}
```

#### 拦截器（Interceptors）

拦截器用于拦截请求和响应，可以在控制器处理请求之前或之后执行操作。

```typescript
// 示例：自定义拦截器
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before executing method...');
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() => console.log(`Method executed in ${Date.now() - now}ms`)),
      );
  }
}
```

### 5. 与其他框架和库的兼容性

NestJS 可以与各种数据库、ORM、认证库和其他 Node.js 库无缝集成，如 TypeORM、Sequelize、MongoDB、Passport、JWT 等。

### 6. 强大的 CLI 工具

NestJS 提供了强大的 CLI 工具，可以帮助开发者快速创建项目、生成组件、运行测试等，提高开发效率。

```bash
# 使用 Nest CLI 创建新项目
nest new my-project

# 生成控制器
nest generate controller users

# 生成服务
nest generate service users

# 生成模块
nest generate module users

# 运行项目
nest start

# 运行项目并监听文件变化
nest start --watch
```

### 7. 活跃的社区和生态系统

NestJS 拥有活跃的社区和不断增长的生态系统，提供了大量的第三方库和插件，可以帮助开发者快速构建复杂的应用程序。

## NestJS 的核心概念

### 1. 控制器（Controllers）

控制器负责处理 HTTP 请求，定义路由，并将请求转发给相应的服务。控制器使用装饰器（如 `@Controller`、`@Get`、`@Post` 等）来定义路由和请求方法。

### 2. 服务（Services）

服务负责处理业务逻辑，与数据库交互，或调用其他服务。服务使用装饰器 `@Injectable` 来标记，以便被注入到控制器或其他服务中。

### 3. 模块（Modules）

模块是 NestJS 应用程序的基本构建块，用于组织代码和依赖关系。每个模块使用装饰器 `@Module` 来定义，并可以导入其他模块、声明控制器和服务、导出服务等。

### 4. 中间件（Middleware）

中间件是在请求处理管道中执行的函数，可以访问请求和响应对象，并可以调用下一个中间件函数。中间件可以用于日志记录、身份验证、请求验证等。

### 5. 管道（Pipes）

管道用于转换和验证数据，可以在控制器处理请求之前或之后执行。管道可以用于参数验证、数据转换、类型转换等。

### 6. 过滤器（Filters）

过滤器用于处理异常，可以捕获控制器、服务或管道中抛出的异常，并返回适当的响应。过滤器可以用于统一异常处理、日志记录等。

### 7. 拦截器（Interceptors）

拦截器用于拦截请求和响应，可以在控制器处理请求之前或之后执行操作。拦截器可以用于日志记录、数据转换、缓存等。

## NestJS 与其他 Node.js 框架的比较

### 1. NestJS vs Express

- Express 是一个轻量级的 Web 框架，提供了基本的路由和中间件支持，但缺乏模块化设计和依赖注入等高级特性。
- NestJS 基于 Express 构建，提供了更多的高级特性，如模块化设计、依赖注入、TypeScript 支持等。
- NestJS 提供了更加结构化的开发方式，适合构建大型、复杂的应用程序。

### 2. NestJS vs Koa

- Koa 是一个由 Express 团队开发的下一代 Web 框架，提供了更加简洁的 API 和更好的错误处理机制。
- NestJS 可以选择使用 Koa 作为底层 HTTP 服务器，提供了与 Koa 类似的性能和灵活性，同时添加了更多的高级特性。

### 3. NestJS vs Sails

- Sails 是一个 MVC 框架，提供了自动生成 API、ORM 支持等特性，但缺乏 TypeScript 支持和模块化设计。
- NestJS 提供了更加现代的架构设计和更好的 TypeScript 支持，适合构建更加复杂的应用程序。

## 总结

NestJS 是一个强大的 Node.js 框架，提供了模块化设计、TypeScript 支持、依赖注入等高级特性，适合构建高效、可扩展的服务器端应用程序。无论是前端开发者想要学习后端开发，还是后端开发者想要学习现代 Node.js 框架，NestJS 都是一个不错的选择。

下一章，我们将学习如何搭建 NestJS 开发环境。
