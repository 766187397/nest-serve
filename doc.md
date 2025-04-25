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

