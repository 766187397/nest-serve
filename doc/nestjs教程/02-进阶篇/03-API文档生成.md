# API文档生成

## 1. Swagger 简介

Swagger 是一个用于生成、描述、调用和可视化 RESTful API 的工具集。它可以自动生成 API 文档，并提供交互式测试界面。

NestJS 提供了 `@nestjs/swagger` 包，用于集成 Swagger。

## 2. 安装依赖

```bash
# 安装 Swagger 相关依赖
npm install @nestjs/swagger swagger-ui-express
```

## 3. 配置 Swagger

### 3.1 基本配置

```typescript
// src/config/swagger.ts
// Swagger 配置文件，首次出现，详细注释说明
import { DocumentBuilder, SwaggerModuleOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('NestJS API 文档') // 文档标题
  .setDescription('这是一个基于 NestJS 构建的 API 文档') // 文档描述
  .setVersion('1.0') // 文档版本
  .addTag('API') // 添加标签
  .addBearerAuth( // 添加 Bearer 认证
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
    'access-token', // 认证名称
  )
  .build();

export const swaggerOptions: SwaggerModuleOptions = {
  swaggerOptions: {
    persistAuthorization: true, // 持久化认证信息
    tagsSorter: 'alpha', // 标签排序
    operationsSorter: 'method', // 操作排序
  },
};
```

### 3.2 注册 Swagger 模块

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig, swaggerOptions } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 配置 Swagger
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, swaggerOptions);
  
  await app.listen(3000);
}
bootstrap();
```

## 4. 使用 Swagger 装饰器

### 4.1 控制器装饰器

```typescript
// src/module/users/users.controller.ts
import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@ApiTags('用户管理') // API 标签
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '创建用户' }) // 操作摘要
  @ApiResponse({ status: 201, description: '用户创建成功', type: User }) // 响应
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiBody({ type: CreateUserDto }) // 请求体
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '获取成功', type: [User] })
  @ApiBearerAuth('access-token') // 需要认证
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: '根据 ID 获取用户' })
  @ApiResponse({ status: 200, description: '获取成功', type: User })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiParam({ name: 'id', description: '用户 ID', example: '123e4567-e89b-12d3-a456-426614174000' }) // 参数
  @ApiBearerAuth('access-token')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '更新成功', type: User })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiParam({ name: 'id', description: '用户 ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiBearerAuth('access-token')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiParam({ name: 'id', description: '用户 ID' })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

### 4.2 DTO 装饰器

```typescript
// src/module/users/dto/create-user.dto.ts
// 创建用户 DTO，首次出现，详细注释说明
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'admin', required: true, minLength: 3, maxLength: 50 })
  @IsString({ message: '用户名必须是字符串' })
  @Length(3, 50, { message: '用户名长度必须在 3-50 个字符之间' })
  username: string;

  @ApiProperty({ description: '密码', example: '123456', required: true, minLength: 6, maxLength: 100 })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 100, { message: '密码长度必须在 6-100 个字符之间' })
  password: string;

  @ApiProperty({ description: '邮箱', example: 'admin@example.com', required: true })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '手机号', example: '13800138000', required: false })
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;
}
```

### 4.3 实体装饰器

```typescript
// src/module/users/entities/user.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @ApiProperty({ description: '用户 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户名', example: 'admin' })
  @Column({ length: 50, comment: '用户名' })
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @Column({ length: 100, comment: '密码' })
  password: string;

  @ApiProperty({ description: '邮箱', example: 'admin@example.com' })
  @Column({ length: 100, comment: '邮箱' })
  email: string;

  @ApiProperty({ description: '手机号', example: '13800138000', required: false })
  @Column({ length: 11, nullable: true, comment: '手机号' })
  phone: string;

  @ApiProperty({ description: '状态：0-禁用，1-启用', example: 1, default: 1 })
  @Column({ default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  @ApiProperty({ description: '创建时间', example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '删除时间', example: '2023-01-01T00:00:00.000Z', required: false })
  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;
}
```

## 5. 使用 Knife4j 增强 Swagger

Knife4j 是一款基于 Swagger 的 API 文档增强工具，提供了更友好的 UI 和更丰富的功能。

### 5.1 安装依赖

```bash
# 安装 Knife4j 相关依赖
npm install knife4j-nestjs-v3
```

### 5.2 配置 Knife4j

```typescript
// src/config/swagger.ts
import { DocumentBuilder, SwaggerModuleOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  // 其他配置...
  .build();

export const swaggerOptions: SwaggerModuleOptions = {
  swaggerOptions: {
    // 其他配置...
  },
};
```

### 5.3 注册 Knife4j 模块

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { Knife4jModule } from 'knife4j-nestjs-v3';

@Module({
  imports: [
    Knife4jModule.register({
      enable: true, // 启用 Knife4j
    }),
    // 其他模块
  ],
})
export class AppModule {}
```

### 5.4 使用 Knife4j

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig, swaggerOptions } from './config/swagger';
import { Knife4jModule } from 'knife4j-nestjs-v3';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 配置 Swagger
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  
  // 配置 Knife4j
  SwaggerModule.setup('api-docs', app, document, swaggerOptions);
  Knife4jModule.setup('doc', app, document);
  
  await app.listen(3000);
}
bootstrap();
```

## 6. API 分组

### 6.1 按模块分组

```typescript
// src/module/auth/auth.controller.ts
import { ApiTags } from '@nestjs/swagger';

@ApiTags('认证管理') // 认证模块标签
@Controller('auth')
export class AuthController {
  // 认证相关方法
}

// src/module/users/users.controller.ts
import { ApiTags } from '@nestjs/swagger';

@ApiTags('用户管理') // 用户模块标签
@Controller('users')
export class UsersController {
  // 用户相关方法
}
```

### 6.2 按版本分组

```typescript
// src/module/users/v1/users.controller.ts
import { ApiTags, ApiVersion } from '@nestjs/swagger';

@ApiTags('用户管理')
@ApiVersion('1') // API 版本 1
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  // V1 版本方法
}

// src/module/users/v2/users.controller.ts
import { ApiTags, ApiVersion } from '@nestjs/swagger';

@ApiTags('用户管理')
@ApiVersion('2') // API 版本 2
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  // V2 版本方法
}
```

## 7. API 文档导出

### 7.1 导出 JSON 文件

```typescript
// src/main.ts
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  
  // 导出 JSON 文件
  writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  
  await app.listen(3000);
}
bootstrap();
```

### 7.2 使用 Swagger UI 离线

将生成的 `swagger.json` 文件导入到 Swagger UI 离线工具中使用。

## 8. 最佳实践

1. **详细的 API 描述**：为每个 API 添加详细的描述、参数说明和响应示例
2. **合理的分组**：按模块或版本对 API 进行分组，便于管理和使用
3. **认证配置**：为需要认证的 API 添加认证信息
4. **数据验证**：在 DTO 中添加验证规则，使用 `class-validator` 进行数据验证
5. **版本管理**：使用 API 版本控制，便于 API 迭代和兼容旧版本
6. **离线文档**：导出 JSON 文件，便于离线使用和团队协作
7. **定期更新**：及时更新 API 文档，确保与代码一致
8. **使用 Knife4j**：增强 Swagger 功能，提供更友好的 UI 界面
9. **示例数据**：为参数和响应添加示例数据，便于理解和测试
10. **错误处理**：详细描述可能的错误响应，便于客户端处理

## 9. 常见问题

### 9.1 认证信息不持久化

**问题**：每次刷新页面都需要重新输入认证信息。

**解决方案**：在 `swaggerOptions` 中设置 `persistAuthorization: true`。

### 9.2 API 文档不显示

**问题**：访问 API 文档页面时，只显示基本框架，不显示 API 信息。

**解决方案**：
1. 检查是否正确注册了 Swagger 模块
2. 检查控制器和方法是否添加了 Swagger 装饰器
3. 检查实体和 DTO 是否添加了 `@ApiProperty` 装饰器
4. 检查是否有编译错误

### 9.3 API 文档更新不及时

**问题**：代码修改后，API 文档没有更新。

**解决方案**：
1. 重启应用服务
2. 检查是否正确使用了装饰器
3. 检查是否有缓存问题

### 9.4 中文乱码

**问题**：API 文档中中文显示乱码。

**解决方案**：
1. 确保文件编码为 UTF-8
2. 确保 Swagger 配置中没有设置错误的字符集
3. 检查浏览器编码设置

### 9.5 大文件上传支持

**问题**：API 文档不支持大文件上传。

**解决方案**：在 Swagger 配置中添加文件上传支持。

```typescript
// src/module/upload/dto/upload.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadDto {
  @ApiProperty({ type: 'string', format: 'binary', description: '文件' })
  file: any;
}
```

## 10. 访问 API 文档

- Swagger UI：http://localhost:3000/api-docs
- Knife4j：http://localhost:3000/doc

## 11. 使用 Swagger 测试 API

1. 打开 API 文档页面
2. 选择需要测试的 API
3. 点击 "Try it out"
4. 填写参数
5. 点击 "Execute"
6. 查看响应结果

## 12. 自动化测试集成

### 12.1 使用 Swagger 生成测试代码

可以使用 Swagger Codegen 工具根据 API 文档生成客户端测试代码。

### 12.2 使用 Jest 测试 API

```typescript
// src/module/users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: '1', username: 'test' }),
            findAll: jest.fn().mockResolvedValue([{ id: '1', username: 'test' }]),
            findOne: jest.fn().mockResolvedValue({ id: '1', username: 'test' }),
            update: jest.fn().mockResolvedValue({ id: '1', username: 'updated' }),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = { username: 'test', password: '123456', email: 'test@example.com' };
    expect(await controller.create(createUserDto)).toEqual({ id: '1', username: 'test' });
    expect(service.create).toHaveBeenCalledWith(createUserDto);
  });
});
```
