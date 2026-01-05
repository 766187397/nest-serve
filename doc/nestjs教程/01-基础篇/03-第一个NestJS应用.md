# 第一个NestJS应用

在本章中，我们将学习如何使用 Nest CLI 创建第一个 NestJS 应用，并了解 NestJS 项目的基本结构。

## 1. 创建 NestJS 项目

使用 Nest CLI 创建一个新的 NestJS 项目非常简单，只需要运行以下命令：

```bash
# 创建一个名为 "my-first-nest-app" 的新项目
nest new my-first-nest-app
```

运行该命令后，Nest CLI 会提示你选择一个包管理器：

```
? Which package manager would you like to use? (Use arrow keys)
❯ npm
  yarn
  pnpm
```

选择你喜欢的包管理器（本教程将使用 npm），然后按 Enter 键。Nest CLI 会自动创建项目目录，安装依赖，并生成基本的项目结构。

## 2. 项目结构

创建完成后，我们来看一下 NestJS 项目的基本结构：

```
my-first-nest-app/
├── src/                  # 源代码目录
│   ├── app.controller.ts # 应用控制器
│   ├── app.controller.spec.ts # 控制器测试文件
│   ├── app.module.ts     # 应用模块
│   ├── app.service.ts    # 应用服务
│   └── main.ts           # 应用入口文件
├── .eslintrc.js          # ESLint 配置文件
├── .gitignore            # Git 忽略文件
├── .prettierrc           # Prettier 配置文件
├── nest-cli.json         # Nest CLI 配置文件
├── package.json          # 项目依赖和脚本
├── tsconfig.build.json   # TypeScript 构建配置
├── tsconfig.json         # TypeScript 配置
└── README.md             # 项目说明文档
```

让我们逐一了解这些文件的作用：

### 2.1 src/main.ts

`main.ts` 是应用的入口文件，负责创建和启动 NestJS 应用实例。

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建 NestJS 应用实例
  const app = await NestFactory.create(AppModule);
  
  // 启动应用，监听 3000 端口
  await app.listen(3000);
  
  // 打印应用启动信息
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// 调用 bootstrap 函数启动应用
bootstrap();
```

### 2.2 src/app.module.ts

`app.module.ts` 是应用的根模块，负责组织和配置应用的各个组件。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],           // 导入其他模块
  controllers: [AppController], // 声明控制器
  providers: [AppService],      // 声明服务
})
export class AppModule {} // 导出根模块
```

### 2.3 src/app.controller.ts

`app.controller.ts` 是应用的控制器，负责处理 HTTP 请求并返回响应。

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // 控制器装饰器，定义路由前缀

export class AppController {
  // 注入 AppService
  constructor(private readonly appService: AppService) {}

  @Get() // GET 请求装饰器，定义路由
  getHello(): string {
    // 调用 AppService 的 getHello 方法
    return this.appService.getHello();
  }
}
```

### 2.4 src/app.service.ts

`app.service.ts` 是应用的服务，负责处理业务逻辑。

```typescript
import { Injectable } from '@nestjs/common';

@Injectable() // 标记该类为可注入的服务
export class AppService {
  // 业务逻辑方法
  getHello(): string {
    return 'Hello World!';
  }
}
```

## 3. 运行应用

现在我们已经了解了项目的基本结构，让我们运行应用：

### 3.1 开发模式运行

使用以下命令在开发模式下运行应用：

```bash
# 使用 npm
npm run start:dev

# 使用 Yarn
yarn start:dev

# 使用 pnpm
pnpm start:dev
```

开发模式下，NestJS 会监听文件变化，自动重新编译和重启应用。

### 3.2 生产模式运行

使用以下命令在生产模式下运行应用：

```bash
# 1. 首先构建应用
npm run build

# 2. 然后运行生产版本
npm run start:prod
```

### 3.3 验证应用运行

应用启动后，打开浏览器访问 `http://localhost:3000`，你应该会看到 "Hello World!" 字符串，说明应用运行成功。

## 4. 项目配置文件

让我们了解一下项目的主要配置文件：

### 4.1 package.json

`package.json` 包含项目的依赖和脚本配置：

```json
{
  "name": "my-first-nest-app",
  "version": "0.0.1",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",      // 构建应用
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"", // 格式化代码
    "start": "nest start",      // 启动应用
    "start:dev": "nest start --watch", // 开发模式启动
    "start:debug": "nest start --debug --watch", // 调试模式启动
    "start:prod": "node dist/main", // 生产模式启动
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix", // 代码检查
    "test": "jest",             // 运行测试
    "test:watch": "jest --watch", // 监视模式运行测试
    "test:cov": "jest --coverage", // 运行测试并生成覆盖率报告
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand" // 调试模式运行测试
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@swc/cli": "^0.5.0",
    "@swc/core": "^1.4.0",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.3.1",
    "@types/supertest": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\.spec\.ts$",
    "transform": {
      "^.+\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### 4.2 tsconfig.json

`tsconfig.json` 是 TypeScript 的配置文件，用于指定编译选项：

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

### 4.3 nest-cli.json

`nest-cli.json` 是 Nest CLI 的配置文件，用于指定 Nest CLI 的行为：

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

## 5. 自定义路由

让我们修改应用，添加一个自定义路由。我们将修改 `app.controller.ts`，添加一个新的 GET 路由 `/about`：

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 添加一个新的 GET 路由
  @Get('about')
  getAbout(): string {
    return 'This is my first NestJS application!';
  }
}
```

修改完成后，保存文件。由于我们使用了开发模式运行应用，NestJS 会自动重新编译和重启应用。

现在，打开浏览器访问 `http://localhost:3000/about`，你应该会看到 "This is my first NestJS application!" 字符串。

## 6. 添加服务方法

现在，让我们修改 `app.service.ts`，添加一个新的方法，然后在控制器中使用它：

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  // 添加一个新的服务方法
  getAbout(): string {
    return 'This is my first NestJS application!';
  }
}
```

然后，修改 `app.controller.ts`，使用新的服务方法：

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('about')
  getAbout(): string {
    // 使用新的服务方法
    return this.appService.getAbout();
  }
}
```

保存文件后，再次访问 `http://localhost:3000/about`，你应该会看到相同的结果。

## 7. 小结

在本章节中，我们学习了：

- 如何使用 Nest CLI 创建一个新的 NestJS 项目
- NestJS 项目的基本结构和各个文件的作用
- 如何运行 NestJS 应用（开发模式和生产模式）
- 如何修改控制器添加自定义路由
- 如何修改服务添加新的方法

现在，你已经成功创建并运行了你的第一个 NestJS 应用！在下一章节中，我们将深入学习 NestJS 控制器的使用。
