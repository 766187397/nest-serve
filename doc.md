# 开发记录

> 记录开发的大致步骤





## 开发环境

- Nodejs 20.19.0
- npm 10.8.2



## 项目搭建

> nest当前推荐node>=20



### 安装脚手架

```bash
npm install -g @nestjs/cli
```



### 创建项目

```bash
nest new nest-serve
```



## 关闭Git大小写

> 防止大小写的原因报错而不知道为什么，window系统不影响但是其他的系统不一样

```
git config core.ignorecase false
```





## 删除多余文件

> 测试和默认的其他文件用不上

1. 删除默认test文件夹（测试使用的）、src中只保留app.module.ts和main.ts
2. 删除引用





## 创建环境变量

> 开发环境：.env.development
>
> 生成环境：.env.production
>
> sqlitedb环境（没有安装MySQL等数据库，sqlite不需要安装其他的）：.env.sqlitedb



### 安装扩展

> 为了修改启动命令来运行不同的环境需要安装扩展

```bash
npm add @nestjs/config dotenv cross-env 
```



### 修改启动命令

> 移除多余的启动命令，增加了不同环境的启动命令

```json
"scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "serve:dev": "cross-env NODE_ENV=dev nest start --watch",
    "serve:prod": "cross-env NODE_ENV=prod nest start --watch",
    "serve:sqlitedb": "cross-env NODE_ENV=sqlitedb nest start --watch",
    "start:prod": "node dist/main",
    "start:debug": "nest start --debug --watch",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
  }
```





## 连接数据库

> 由于环境原因我需要连接MySQL和sqlite两者（当前所有的数据库操作都是在sqlite中实现的，这个电脑没有MySQL环境）

### 安装依赖

```bash
yarn add mysql2 sqlite3 typeorm @nestjs/typeorm
```



## 过滤字段返回表单校验

> 部分保存的格式和返回的格式一样，或者某些字段不返回

```bash
npm i class-transformer dayjs class-validator
```



## 封装公共的实例

> 后续的大多数实例基础这个实例

```typescript
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Exclude, Transform } from "class-transformer";
import dayjs from "dayjs";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ comment: "ID" })
  id: number;

  @Column({ default: 1, comment: "排序" })
  sort: number;

  @Column({ default: 1, comment: "1 - 启用，0 - 禁用，根据业务定义" })
  status: number;

  @Exclude({ toPlainOnly: true })
  @Column({ default: "web", comment: "平台标识（如admin/web/app/mini）" })
  platform: string;

  @CreateDateColumn({ comment: "创建时间" })
  @Transform(({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm:ss"))
  createdAt: Date;

  @UpdateDateColumn({ comment: "更新时间" })
  @Transform(({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm:ss"))
  updatedAt: Date;

  @DeleteDateColumn({ comment: "删除时间" })
  @Transform(({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm:ss"))
  deletedAt: Date;
}

```



## 创建公共的DTO

> 将公共的请求参数抽离处理方便后续使用

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { IsStringOrNumber } from "@/common/utils/class-validator";

/**
 * 创建基础数据
 */
export class CreateBaseDto {
  @ApiProperty({ description: "排序", required: false, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: "排序值必须为数字" })
  sort?: number;

  @ApiProperty({ description: "状态；1 - 启用，2 - 禁用；根据模块业务定义", required: false, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: "状态值必须为数字" })
  status?: number;
}

/**
 * 查询参数
 */
export class FindByParameter {
  @ApiProperty({ description: "id", required: false, example: 1 })
  @IsOptional()
  @IsStringOrNumber()
  id?: number | string;

  @ApiProperty({
    description: "排序: ASC - 升序，DESC - 降序",
    required: false,
    enum: ["ASC", "DESC"],
    default: "DESC",
  })
  @IsOptional()
  @IsString({ message: "排序值必须为字符串" })
  sort?: string;

  @ApiProperty({ description: "状态；1 - 启用，2 - 禁用；根据模块业务定义", required: false, example: 1 })
  @IsStringOrNumber()
  status?: number | string;

  @ApiProperty({ description: "时间范围(根据创建时间查询)", required: false, example: "2020-01-01" })
  @IsOptional()
  @IsArray({ message: "时间范围必须为数组" })
  time?: Date[] | string[];
}

/**
 * 分页查询
 */
export class FindByPage extends FindByParameter {
  @ApiProperty({ name: "page", type: Number, required: false, description: "页码", default: 1 })
  @IsOptional()
  @IsStringOrNumber()
  page?: string;

  @ApiProperty({ name: "pageSize", type: Number, required: false, description: "每页数量", default: 10 })
  @IsOptional()
  @IsStringOrNumber()
  pageSize?: string;
}

```



## 生成users模块

> 用户模块  --no-spec 禁用规范文件生成

```bash
nest g resource module/users --no-spec
```



## 配置路径别名

> 如果使用相对路径引用会很不方便，后续修改复制等都不适用，配置项目的路径别名方便引用文件

tsconfig.build.json

```json
"compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
```

tsconfig.json

```json
"paths": {
      "@/*": ["src/*"]
    }
```



## 生成接口文档（swagger）

### 安装

```bash
yarn add @nestjs/swagger swagger-ui-express
```



### 增加配置文件

> config/swagger.ts

```typescript
import { DocumentBuilder } from "@nestjs/swagger";
export class SwaggerConfig {
  static swaggerOptions = new DocumentBuilder()
    .setTitle("NestJS API") // API 文档的标题
    .setDescription("NestJS API description") // API 文档的描述
    .setVersion("1.0") // API 的版本
    .addServer(global.url, "项目地址")
    .build();
}
```



## 主文件中使用

```typescript
import * as dotenv from "dotenv";
// 根据环境加载对应的 .env 文件
const envFilePath = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFilePath });

// 项目地址端口
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";
const url = `http://${host}:${port}`;
global.url = url;

import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule } from "@nestjs/swagger";
import { SwaggerConfig } from "./config/swagger";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(port).then((res) => {
    console.log(`当前环境为：${envFilePath}`);
    console.log(`server to ${url}`);
    console.log(`swagger to ${url}/swagger`);
    console.log(`knife4j to ${url}/api/doc?v=1`);
  });
}
bootstrap();

```



## 设置user的文档通用说明

> 在路由最上层设置后面的会继承，如果有不一样的就在子模块上设置会覆盖
>
> 修改Controller中的地址为：api/v1/backend/users
>
> api：请求
>
> v1：版本
>
> backend：平台-后台
>
> users：模块
>
> *：具体的请求

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto } from "./dto/index";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("用户管理")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "创建用户" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}

```



**当前运行代码可以在http://localhost:3000/swagger看到swagger接口文档**



## 封装统一返回结构和拦截器

> 方便维护对接以及判断

### 统一返回结构

```typescript
import { HttpException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

interface Result<T> {
  code?: number;
  message?: string;
  data?: T | null;
  dto?: any;
}
export class ApiResult<T> {
  readonly __isApiResult = true;

  constructor(
    public code: number = 200,
    public message: string = "操作成功",
    public data: T | null = null
  ) {}

  static success<T>({ data = null, message = "操作成功", code = 200, dto }: Result<T>): ApiResult<T> {
    if (dto) {
      data = plainToInstance(dto, data);
    }
    return new ApiResult<T>(code, message, data);
  }

  static error<T>(param: Error | string | Result<T>): ApiResult<T> {
    let message = "操作失败",
      code = 500,
      data: T | null = null;
    if (param instanceof HttpException) {
      // 获取 HttpException 的响应内容和状态码
      const response = param.getResponse();
      // 如果是对象，直接使用其中的 message 字段，否则使用默认的 message
      const errorMessage = typeof response === "object" && response["message"] ? response["message"] : message;
      const statusCode = param.getStatus() || code; // 获取 HttpException 的状态码，默认使用传入的 code
      return new ApiResult<T>(statusCode, errorMessage, null);
    } else if (typeof param === "string") {
      // 如果是字符串类型，认为它是错误消息
      message = param;
    } else if (param instanceof Error) {
      // 处理 Error 对象类型
      message = param.message; // 使用 Error 的 message 属性
    } else {
      // 否则认为是一个包含 code, message, data 的对象
      // 处理包含 code, message, data 的对象
      if (param.code) code = param.code;
      if (param.message) message = param.message;
      if (param.data) data = param.data;
    }
    return new ApiResult<T>(code, message, data);
  }
}

```



### 拦截器

```typescript
// api-result.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResult } from "@/common/utils/result";

@Injectable()
export class ApiResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        if (data.__isApiResult) {
          delete data.__isApiResult;
          response.status(data.code);
          return {
            code: data.code,
            message: data.message,
            data: data.data,
          };
        }
        // 如果请求路径以 /api 开头，则包装成成功的响应
        else if (request.url.startsWith("/api/")) {
          // 否则包装成成功的响应
          response.status(HttpStatus.OK);
          return {
            code: HttpStatus.OK,
            message: "操作成功",
            data,
          };
        }
        return data;
      })
    );
  }
}

```



### 在跟模块中使用

```typescript
import { Module } from "@nestjs/common";
import { UsersModule } from "./module/users/users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { Knife4jModule } from "./module/knife4j/knife4j.module";
import { ApiResultInterceptor } from "@/common/interceptor/api-result.interceptor";
import { APP_INTERCEPTOR } from "@nestjs/core";

@Module({
  imports: [
    // 配置 ConfigModule 作为全局模块，并根据 NODE_ENV 加载相应的 .env 文件
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>("DB_TYPE") as "mysql" | "sqlite";
        if (dbType === "sqlite") {
          return {
            type: dbType,
            database: configService.get("DB_DATABASE"),
            synchronize: process.env.NODE_ENV !== "production", // 开发环境可以为 true，生产环境为 false
            logging: process.env.NODE_ENV !== "production", // 开发环境启用日志
            entities: [join(__dirname, "**", "*.entity{.ts,.js}")], // 匹配所有 .entity.ts 或 .entity.js 文件
            migrations: ["src/migrations/**/*{.ts,.js}"], // 迁移路径
          };
        } else {
          return {
            type: dbType,
            host: configService.get("DB_HOST"),
            port: configService.get<number>("DB_PORT"),
            username: configService.get("DB_USER"),
            password: configService.get("DB_PASSWORD"),
            database: configService.get("DB_DATABASE"),
            synchronize: process.env.NODE_ENV !== "production", // 开发环境可以为 true，生产环境为 false
            logging: process.env.NODE_ENV !== "production", // 开发环境启用日志
            entities: [join(__dirname, "**", "*.entity{.ts,.js}")], // 匹配所有 .entity.ts 或 .entity.js 文件
            migrations: ["src/migrations/**/*{.ts,.js}"], // 迁移路径
          };
        }
      },
      inject: [ConfigService],
    }),
    UsersModule,
    Knife4jModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResultInterceptor,
    },
  ],
})
export class AppModule {}

```



## knife4j

> knife4j是在java项目中才比较常用的接口文档插件，对UI页面进行了美化和功能的增加，但是没有node版本，如果需要使用则需要将swagger生成的文档手动编写接口

## 使用knife4j

> knife4j是在java项目中才比较常用的接口文档插件，对UI页面进行了美化和功能的增加，但是没有node版本，如果需要使用则需要将swagger生成的文档手动编写接口

### 下载前端文件

- 下载代码

  ```bash
  git clone https://gitee.com/xiaoym/knife4j.git
  ```

- 进入前端版本knife4j-vue

- 安装依赖后打包复制到项目的根目录（和src同级，可以改改名称和ico文件，我当前改为public、index.html）

- 编写代码...



### 安装@nestjs/serve-static

> 将静态文件暴露出来

```bash
npm i @nestjs/serve-static
```



### 在根路径暴露swagger的数据

```typescript
// 将 Swagger 文档存储在全局对象中
global.swaggerDocument = document;
```



### 生成CRUD

```bash
nest g resource module/knife4j --no-spec
```

`删除dto文件和entities`



### 编写接口并通过路由指定静态文件

knife4j.controller.ts

```typescript
import { Controller, Get, Param, Res } from "@nestjs/common";
import { Knife4jService } from "./knife4j.service";
import { Response } from "express"; // 导入 Express 的 Response 类型
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("接口文档")
@Controller("")
export class Knife4jController {
  constructor(private readonly knife4jService: Knife4jService) {}

  @Get("json")
  @ApiOperation({ summary: "获取 Swagger JSON" })
  getSwagger() {
    return this.knife4jService.getSwagger();
  }

  @Get("download")
  @ApiOperation({ summary: "下载 Swagger JSON" })
  download(@Res({ passthrough: true }) res: Response) {
    let swaggerJson = this.knife4jService.getSwagger();
    // 设置响应头，告诉浏览器这是一个附件（即文件下载）
    res.set({
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=swagger.json",
    });

    // 如果你想要直接发送 JSON 字符串而不是从文件系统读取，可以这样做：
    return JSON.stringify(swaggerJson.data);
  }

  @Get("v3/api-docs/swagger-config")
  @ApiOperation({ summary: "knife4j 接口文档配置" })
  getSwaggerConfig(@Res({ passthrough: true }) res: Response) {
    let swaggerDocs = this.knife4jService.getSwagger().data;
    const groups = [
      {
        name: "全部",
        location: `/api-docs/全部`,
        url: `/api-docs/全部`,
        swaggerVersion: "3.0.0",
        servicePath: "",
      },
    ];

    // 遍历所有路径，提取分组信息
    const uniqueTags = new Set();
    for (const path in swaggerDocs.paths) {
      const pathObject = swaggerDocs.paths[path];
      for (const method in pathObject) {
        const operation = pathObject[method];
        if (operation && operation.tags) {
          operation.tags.forEach((tag: string) => {
            uniqueTags.add(tag);
          });
        }
      }
    }

    // 生成分组资源
    uniqueTags.forEach((tag) => {
      groups.push({
        name: tag as string,
        location: `/api-docs/${tag}`,
        url: `/api-docs/${tag}`,
        swaggerVersion: "3.0.0",
        servicePath: "",
      });
    });
    swaggerDocs.urls = groups;
    res.setHeader("Content-Type", "application/json");
    return swaggerDocs
  }

  @Get("swagger-resources")
  @ApiOperation({ summary: "knife4j 接口文档配置" })
  getSwaggerResources(@Res({ passthrough: true }) res: Response) {
    let swaggerDocs = this.knife4jService.getSwagger().data;
    const groups = [
      {
        name: "全部",
        location: `/api-docs/全部`,
        url: `/api-docs/全部`,
        swaggerVersion: "3.0.0",
        servicePath: "",
      },
    ];

    // 遍历所有路径，提取分组信息
    const uniqueTags = new Set();
    for (const path in swaggerDocs.paths) {
      const pathObject = swaggerDocs.paths[path];
      for (const method in pathObject) {
        const operation = pathObject[method];
        if (operation && operation.tags) {
          operation.tags.forEach((tag: string) => {
            uniqueTags.add(tag);
          });
        }
      }
    }

    // 生成分组资源
    uniqueTags.forEach((tag) => {
      groups.push({
        name: tag as string,
        location: `/api-docs/${tag}`,
        url: `/api-docs/${tag}`,
        swaggerVersion: "3.0.0",
        servicePath: "",
      });
    });

    res.json(groups);
  }

  @Get("api-docs/:groupName")
  @ApiOperation({ summary: "knife4j 分组接口文档" })
  getSwaggerByGroup(@Param("groupName") groupName: string) {
    let swaggerJson = this.knife4jService.getSwagger();
    let swaggerDocs = swaggerJson.data;
    let paths = swaggerDocs.paths;
    let groupPaths = {};
    if (groupName === "全部") {
      return swaggerDocs;
    }
    for (let path in paths) {
      let pathObject = paths[path];
      for (let method in pathObject) {
        let operation = pathObject[method];
        if (operation && operation.tags && operation.tags.includes(groupName)) {
          groupPaths[path] = groupPaths[path] || {};
          groupPaths[path][method] = operation;
        }
      }
    }
    swaggerDocs.paths = groupPaths;
    return swaggerDocs;
  }
}

```



knife4j.module.ts

```typescript
import { Module } from "@nestjs/common";
import { Knife4jService } from "./knife4j.service";
import { Knife4jController } from "./knife4j.controller";
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
  imports: [
    ServeStaticModule.forRoot(
      {
        rootPath: "knife4j/index.html",
        serveRoot: "/doc.html", // 主文件访问路径
        serveStaticOptions: {
          maxAge: "1y", // 设置缓存时间
        },
      },
      {
        rootPath: "knife4j",
        serveRoot: "/", // 设置静态文件访问路径
        serveStaticOptions: {
          maxAge: "1y", // 设置缓存时间
        },
      }
    ),
  ],
  controllers: [Knife4jController],
  providers: [Knife4jService],
})
export class Knife4jModule {}

```



knife4j.service.ts

```typescript
import { Injectable } from "@nestjs/common";
import { ApiResult } from "@/common/utils/result";

@Injectable()
export class Knife4jService {
  getSwagger() {
    return ApiResult.success<any>({ data: global.swaggerDocument });
  }
}

```



**在运行代码加上打印console.log(`knife4j to ${url}/doc.html`);**

**此时运行代码可以看到knife4j的地址：knife4j to http://localhost:3000/doc.html**
