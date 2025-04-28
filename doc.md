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
import * as dayjs from "dayjs";

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

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn({ comment: "删除时间" })
  @Transform(({ value }) => dayjs(value).format("YYYY-MM-DD HH:mm:ss"))
  deletedAt: Date;
}

```



## 创建公共的DTO

> 将公共的请求参数抽离处理方便后续使用

```typescript
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { IsStringOrNumber } from "@/common/utils/class-validator";
import { FindOptionsOrderValue } from "typeorm";

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
 * 通过ID处理数据
 */
export class ProcessDataThroughID {
  @ApiProperty({ description: "id", required: true, example: 1 })
  @IsStringOrNumber()
  id: number | string;
}

/**
 * 查询参数
 */
export class FindByParameter {
  @ApiProperty({
    description: "排序: ASC - 升序，DESC - 降序",
    required: false,
    enum: ["ASC", "DESC"],
    default: "DESC",
  })
  @IsOptional()
  @IsString({ message: "排序值必须为字符串" })
  sort?: FindOptionsOrderValue;

  @ApiProperty({
    type: "string",
    description: "状态；1 - 启用，2 - 禁用；根据模块业务定义",
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsStringOrNumber()
  status?: number | string;

  @ApiProperty({
    type: "string",
    description: "时间范围(根据创建时间查询)以逗号分隔",
    required: false,
    example: "2025-1-1 10:10:10,2025-1-2 23:59:59",
  })
  @IsOptional()
  @IsString({ message: "time必须为字符串" })
  time?: string;
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
        // 如果请求路径以 /api/ 开头，则包装成成功的响应，/api/基本上是当前自己开发接口的前缀如果后续有其他的可以再来改这个判断
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



## 封装空值管道校验

> 防止查询条件传入空值查询为空

common/interceptor/filterEmptyPipe.ts

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";

/** 过滤空值：空字符串、null、undefined */
@Injectable()
export class FilterEmptyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === "object") {
      return Object.keys(value).reduce((acc, key) => {
        if (value[key] !== "" && value[key] !== null && value[key] !== undefined) {
          acc[key] = this.transform(value[key], metadata);
        }
        return acc;
      }, {});
    }
    return value;
  }
}

```



## 封装BaseService

> 内置一些方法方便后面统一使用，后续开发的service，继承这个类，统一使用这里的方法方便后续维护

```typescript
import * as dayjs from "dayjs";
import { Between, FindOptionsOrderValue } from "typeorm";

export class BaseService {
  /**
   * 通用的处理查询条件
   * @param {object} query 查询条件
   * @returns {{ [key: string]: any }} 处理后的查询条件
   */
  buildCommonQuery(query: { [key: string]: any } | undefined): { [key: string]: any } {
    if (typeof query === "undefined") {
      return {};
    }
    let where: { [key: string]: any } = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.time && query.time.length === 2) {
      let start = dayjs(query.time[0]).startOf("day").toDate();
      let end = dayjs(query.time[1]).endOf("day").toDate();
      where.createdAt = Between(start, end);
    }
    return where;
  }

  /**
   * 处理默认排序 处理createdAt和id
   * @param {{ [key: string]: any }} sort DESC | ASC
   * @returns {{[key: string]: FindOptionsOrderValue}} 处理后的排序条件
   */
  buildCommonSort(sort: { [key: string]: any } | undefined): {
    [key: string]: FindOptionsOrderValue;
  } {
    if (!sort || typeof sort === "undefined") {
      return { createdAt: "DESC", id: "DESC" };
    }

    return {
      createdAt: "DESC",
      id: "DESC",
    };
  }

  /**
   * 统一计算分页函数
   * @param {number|string} page 页码
   * @param {number|string} pageSize 每页数量
   * @returns {Object} {take:number,skip:number}
   * @throws {Error} page和pageSize必须为正整数或字符串形式的正整数
   */
  buildCommonPaging(page: number | string = 1, pageSize: number | string = 10): { take: number; skip: number } {
    page = +page;
    pageSize = +pageSize;
    if (!Number.isInteger(page) || !Number.isInteger(pageSize)) {
      throw new Error("page和pageSize必须为正整数或字符串形式的正整数");
    }
    if (page < 1) {
      throw new Error("page不能小于1");
    }
    if (pageSize < 1) {
      throw new Error("pageSize不能小于1");
    }
    // 计算take和skip
    const take = pageSize;
    const skip = (page - 1) * pageSize;
    return { take, skip };
  }
}

```



## 用户的CRUD

> 主要还是记录抽离的封装的内容，也是给后面作为参照

- dto/index.ts

  - 删除里面的所有文件，新建index.ts，这里的创建用户和更新查询等都有继承最开始封装的，并且加上了表单校验以及swagger文档生成

    ```typescript
    import { CreateBaseDto, FindByParameter } from "@/common/dto/base";
    import { ApiProperty } from "@nestjs/swagger";
    import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
    
    /**
     * 用户创建Dto
     */
    export class CreateUserDto extends CreateBaseDto {
      @ApiProperty({ description: "用户名", example: "admin" })
      @IsString({ message: "用户名字符串" })
      @IsNotEmpty({ message: "用户名是必填项" }) // 必填校验
      userName: string;
    
      @ApiProperty({ description: "昵称", example: "管理员" })
      @IsString({ message: "昵称字符串" })
      @IsNotEmpty({ message: "昵称是必填项" })
      nickName: string;
    
      @ApiProperty({ description: "密码", example: "123456" })
      @IsString({ message: "密码字符串" })
      @IsNotEmpty({ message: "密码是必填项" })
      password: string;
    
      @ApiProperty({ description: "邮箱", required: false, example: "admin@qq.com" })
      @IsOptional() // 可选
      @IsEmail({}, { message: "邮箱格式错误" })
      email?: string;
    
      @ApiProperty({ description: "手机号", required: false, example: "13800138000" })
      @IsOptional()
      @Matches(/^1[3456789]\d{9}$/, { message: "手机号格式错误" }) // 正则校验
      phone?: string;
    
      @ApiProperty({ description: "性别 0未知 1男 2女", required: false, example: "0", enum: ["0", "1", "2"] })
      @IsOptional()
      @IsIn(["0", "1", "2"], { message: "性别只能是0、1、2" }) // 枚举校验
      sex?: string;
    
      @ApiProperty({ description: "头像", required: false, example: "" })
      @IsOptional()
      @IsString()
      avatar?: string;
    }
    
    /**
     * 用户更新Dto
     */
    export class UpdateUserDto {
      @ApiProperty({ description: "用户名", example: "admin" })
      @IsOptional()
      @IsString()
      userName?: string | undefined;
    
      @ApiProperty({ description: "昵称", example: "管理员" })
      @IsOptional()
      @IsString()
      nickName?: string | undefined;
    
      @ApiProperty({ description: "密码", example: "123456" })
      @IsString()
      password?: string | undefined;
    
      @ApiProperty({ description: "邮箱", required: false, example: "admin@qq.com" })
      @IsOptional()
      @IsEmail({}, { message: "邮箱格式错误" })
      email?: string | undefined;
    
      @ApiProperty({ description: "手机号", required: false, example: "13800138000" })
      @IsOptional()
      @Matches(/^1[3456789]\d{9}$/, { message: "手机号格式错误" })
      phone?: string | undefined;
    
      @ApiProperty({ description: "性别 0未知 1男 2女", required: false, example: "0", enum: ["0", "1", "2"] })
      @IsOptional()
      @IsIn(["0", "1", "2"], { message: "性别只能是0、1、2" })
      sex?: string | undefined;
    
      @ApiProperty({ description: "头像", required: false, example: "" })
      @IsOptional()
      @IsString()
      avatar?: string | undefined;
    }
    
    /**
     * 查询所有用户信息
     */
    export class FindUserDto extends FindByParameter {
      @ApiProperty({ type: "string", description: "用户名", required: false, example: "admin" })
      @IsOptional()
      @IsString()
      userName?: string | undefined;
    
      @ApiProperty({ type: "string", description: "昵称", required: false, example: "管理员" })
      @IsOptional()
      @IsString()
      nickName?: string | undefined;
    
      @ApiProperty({ type: "string", description: "邮箱", required: false, example: "admin@qq.com" })
      @IsOptional()
      @IsEmail({}, { message: "邮箱格式错误" })
      email?: string | undefined;
    
      @ApiProperty({ type: "string", description: "手机号", required: false, example: "13800138000" })
      @IsOptional()
      @Matches(/^1[3456789]\d{9}$/, { message: "手机号格式错误" })
      phone?: string | undefined;
    }
    
    /**
     * 分页查询用户信息
     */
    export class FindUserDtoByPage extends FindUserDto {
      @ApiProperty({ name: "page", type: Number, required: false, description: "页码", default: 1 })
      @IsOptional()
      @IsString({ message: "page必须是字符串" })
      page?: string;
    
      @ApiProperty({ name: "pageSize", type: Number, required: false, description: "每页数量", default: 10 })
      @IsOptional()
      @IsString({ message: "pageSize必须是字符串" })
      pageSize?: string;
    }
    
    ```

- entities/user.entity.ts

  - 用户表的信息，并且继承了最开始封装的BaseEntity，加上了复合索引（据说是优化查询的）

    ```typescript
    import { BaseEntity } from "@/common/entities/base";
    import { Column, Entity, Index } from "typeorm";
    import { Exclude } from "class-transformer";
    
    @Entity("users", { comment: "用户信息表" })
    // 复合索引 优化同时查询id和deletedAt的情况
    @Index("IDX_users_id_deletedAt", ["id", "deletedAt"])
    export class User extends BaseEntity {
      @Column({ type: "varchar", name: "user_name", length: 30, nullable: false, comment: "用户账号" })
      userName: string;
    
      @Column({ type: "varchar", name: "nick_name", length: 30, nullable: false, comment: "用户昵称" })
      nickName: string;
    
      @Exclude({ toPlainOnly: true }) // 输出屏蔽密码
      @Column({ type: "varchar", name: "password", length: 255, nullable: false, default: "", comment: "用户登录密码" })
      password: string;
    
      @Column({ type: "varchar", name: "email", length: 50, default: "", comment: "邮箱" })
      email: string;
    
      @Column({ type: "varchar", name: "phone_number", default: "", length: 11, comment: "手机号码" })
      phone: string;
    
      //0未知 1男 2女
      @Column({ type: "varchar", name: "sex", default: "0", length: 1, comment: "性别" })
      sex: string;
    
      @Column({ type: "varchar", name: "avatar", default: "", comment: "头像地址" })
      avatar: string;
    }
    
    ```

- users.controller.ts

  - 用户管理的控制器，入口最上面的ApiResponse是下面所有接口的请求文档描述，api/v1/backend/users是个人自定义的接口地址，并且这里也使用到了上封装的FilterEmptyPipe来处理空值，+id是转为我数字

    ```typescript
    import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
    import { UsersService } from "./users.service";
    import { ProcessDataThroughID } from "@/common/dto/base";
    import { CreateUserDto, UpdateUserDto, FindUserDto, FindUserDtoByPage } from "./dto/index";
    import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
    import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";
    
    @ApiTags("用户管理")
    @ApiResponse({ status: 200, description: "操作成功" })
    @ApiResponse({ status: 201, description: "操作成功，无返回内容" })
    @ApiResponse({ status: 400, description: "参数错误" })
    @ApiResponse({ status: 401, description: "token失效，请重新登录" })
    @ApiResponse({ status: 403, description: "权限不足" })
    @ApiResponse({ status: 404, description: "请求资源不存在" })
    @ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
    @Controller("api/v1/backend/users")
    export class UsersController {
      constructor(private readonly usersService: UsersService) {}
    
      @Post()
      @ApiOperation({ summary: "创建用户" })
      create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
      }
    
      @Get("/page")
      @ApiOperation({ summary: "查询用户列表(分页)" })
      findByPage(@Query(new FilterEmptyPipe()) findUserDtoByPage: FindUserDtoByPage) {
        return this.usersService.findByPage(findUserDtoByPage);
      }
    
      @Get()
      @ApiOperation({ summary: "查询用户列表(不分页)" })
      findAll(@Query(new FilterEmptyPipe()) findUserDto: FindUserDto) {
        return this.usersService.findAll(findUserDto);
      }
    
      @Get(":id")
      @ApiOperation({ summary: "查询用户详情" })
      findOne(@Param("id") id: ProcessDataThroughID) {
        return this.usersService.findOne(+id);
      }
    
      @Patch(":id")
      @ApiOperation({ summary: "更新用户信息" })
      update(@Param("id") id: ProcessDataThroughID, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
      }
    
      @Delete(":id")
      @ApiOperation({ summary: "删除用户" })
      remove(@Param("id") id: string) {
        return this.usersService.remove(+id);
      }
    }
    
    ```

- users.module.ts

  - users的模块管理文件，只有在这里导入了的模块才能正常使用否则报错

    ```typescript
    import { Module } from "@nestjs/common";
    import { UsersService } from "./users.service";
    import { UsersController } from "./users.controller";
    import { User } from "./entities/user.entity";
    import { TypeOrmModule } from "@nestjs/typeorm";
    
    @Module({
      imports: [TypeOrmModule.forFeature([User])],
      controllers: [UsersController],
      providers: [UsersService],
    })
    export class UsersModule {}
    
    ```

- users.service.ts

  - CRUD具体的方法

    ```typescript
    import { Injectable } from "@nestjs/common";
    import { CreateUserDto, FindUserDto, FindUserDtoByPage, UpdateUserDto } from "./dto/index";
    import { ApiResult } from "@/common/utils/result";
    import { InjectRepository } from "@nestjs/typeorm";
    import { User } from "./entities/user.entity";
    import { Repository } from "typeorm";
    import { BaseService } from "@/common/service/base";
    
    @Injectable()
    export class UsersService extends BaseService {
      constructor(
        @InjectRepository(User) // NestJS 会根据这个装饰器将 UserRepository 自动注入到 userRepository 变量中。
        private userRepository: Repository<User> // 这是一个 TypeORM 提供的 Repository 对象，封装了对 User 实体的所有数据库操作方法
      ) {
        super();
      }
    
      /**
       * 创建用户
       * @param {CreateUserDto} createUserDto  创建用户DTO
       * @returns {Promise<ApiResult<any>>} 统一返回结果
       */
      async create(createUserDto: CreateUserDto): Promise<ApiResult<any>> {
        try {
          // 查询数据库，确保 userName, phone, email 不存在
          const { userName = null, phone = null, email = null } = createUserDto;
    
          // 构建查询条件
          const queryBuilder = this.userRepository.createQueryBuilder("user");
          userName && queryBuilder.andWhere("user.userName = :userName", { userName });
          phone && queryBuilder.orWhere("user.phone = :phone", { phone });
          email && queryBuilder.orWhere("user.email = :email", { email });
          // 执行查询
          const existingUser = await queryBuilder.getOne();
          // 如果查询结果存在，返回错误
          if (existingUser) {
            return ApiResult.error<string>("用户名、电话号码或邮箱已存在");
          }
          // createUserDto.password = CryptoUtil.encrypt(createUserDto.password as string);
          const user = this.userRepository.create(createUserDto); // 创建 User 实体
          // if (roleIds.length > 0) {
          //   user.roles = await this.roleRepository.find({ where: { id: In(roleIds) } });
          // }
          let data = await this.userRepository.save(user); // 保存到数据库并返回
          return ApiResult.success({ data });
        } catch (error) {
          return ApiResult.error<any>(error);
        }
      }
    
      /**
       * 分页查询
       * @param {FindUserDtoByPage} findUserDtoByPage 查询条件
       * @returns {Promise<ApiResult<any>>} 统一返回结果
       */
      async findByPage(findUserDtoByPage?: FindUserDtoByPage): Promise<ApiResult<any>> {
        try {
          let { take, skip } = this.buildCommonPaging(findUserDtoByPage?.page, findUserDtoByPage?.pageSize);
          let where = this.buildCommonQuery(findUserDtoByPage);
          let order = this.buildCommonSort(findUserDtoByPage);
          // 查询符合条件的用户
          const [data, total] = await this.userRepository.findAndCount({
            where: {
              ...where,
              userName: findUserDtoByPage?.userName,
              nickName: findUserDtoByPage?.nickName,
              email: findUserDtoByPage?.email,
              phone: findUserDtoByPage?.phone,
            },
            order: {
              ...order,
            },
            skip, // 跳过的条数
            take, // 每页条数
          });
    
          // 计算总页数
          const totalPages = Math.ceil(total / take);
          return ApiResult.success({
            data: {
              data,
              total,
              totalPages,
              page: findUserDtoByPage?.page || 1,
              pageSize: findUserDtoByPage?.pageSize || 10,
            },
          });
        } catch (error) {
          return ApiResult.error(error || "用户查询失败，请稍后再试");
        }
      }
    
      /**
       * 查询所有用户
       * @param {FindUserDto} findUserDto 查询条件
       * @returns {Promise<ApiResult<any>>} 统一返回结果
       */
      async findAll(findUserDto?: FindUserDto): Promise<ApiResult<any>> {
        try {
          let where = this.buildCommonQuery(findUserDto);
          let order = this.buildCommonSort(findUserDto);
          let data = await this.userRepository.find({
            where: {
              ...where,
              userName: findUserDto?.userName,
              nickName: findUserDto?.nickName,
              email: findUserDto?.email,
              phone: findUserDto?.phone,
            },
            order: {
              ...order,
            },
          }); // 查询所有用户并返回;
          return ApiResult.success({ data });
        } catch (error) {
          return ApiResult.error(error || "用户查询失败，请稍后再试");
        }
      }
    
      /**
       * 通过ID查询详情
       * @param {number} id
       * @returns {Promise<ApiResult<any>>} 统一返回结果
       */
      async findOne(id: number): Promise<ApiResult<any>> {
        try {
          let data = await this.userRepository.findOne({ where: { id } });
          return ApiResult.success({ data });
        } catch (error) {
          return ApiResult.error(error || "用户查询失败，请稍后再试");
        }
      }
    
      /**
       * 修改用户信息
       * @param {number} id 用户ID
       * @param updateUserDto 更新用户信息
       * @returns {Promise<ApiResult<any>>} 统一返回结果
       */
      async update(id: number, updateUserDto: UpdateUserDto): Promise<ApiResult<any>> {
        try {
          let data = await this.userRepository.update(id, updateUserDto);
          return ApiResult.success({ data });
        } catch (error) {
          return ApiResult.error(error || "用户更新失败，请稍后再试");
        }
      }
    
      /**
       * 删除用户信息
       * @param {number} id 用户ID
       * @returns {Promise<ApiResult<any>>} 统一返回结果
       */
      async remove(id: number): Promise<ApiResult<any>> {
        try {
          let data = await this.userRepository.softDelete(id);
          return ApiResult.success({ data });
        } catch (error) {
          return ApiResult.error(error || "用户删除失败，请稍后再试");
        }
      }
    }
    
    ```



**此时可以在http://localhost:3000/doc.html中测试接口是否正常使用**



## Git提交记录

> 方便有需要从这个记录抽离分支查看代码

**2025-04-28**

docs(nest-serve): 更新文档并添加用户管理模块

- 更新文档：调整代码示例，优化描述内容
- 添加用户管理模块：包括用户实体、DTO、服务、控制器和模块定义
- 封装空值管道校验和通用排序方法
