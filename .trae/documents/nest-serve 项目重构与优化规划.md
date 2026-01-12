# nest-serve 项目优化实施计划（聚焦核心问题）

## 一、核心问题分析

### 问题一：数据库兼容性不足
**现状**：仅支持MySQL和SQLite
**需求**：增加PostgreSQL支持

### 问题二：缓存方案不完善
**现状**：仅使用node-cache（内存缓存）
**需求**：优先使用Redis，不可用时降级使用node-cache

### 问题三：API设计不规范
**现状**：不符合RESTful API规范
**需求**：按照标准RESTful API规范重构所有接口

---

## 二、实施方案

### 阶段一：数据库兼容性改造（优先级：最高）

#### 1.1 安装PostgreSQL依赖
```bash
npm install pg
npm install --save-dev @types/pg
```

#### 1.2 修改数据库配置文件
**文件**：`src/config/db.ts`

**改造内容**：
- 增加`PgConfig`接口定义
- 增加`pgConfig`配置对象
- 修改`dbConfig`和`dbLogger`的类型判断逻辑，支持`postgres`类型

**改造后的代码结构**：
```typescript
import { join } from "path";

const env = process.env;

export interface MysqlConfig {
  DB_TYPE: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
}

export interface PgConfig {
  DB_TYPE: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
}

export interface SqliteConfig {
  DB_TYPE: string;
  DB_DATABASE: string;
}

const mysqlConfig: MysqlConfig = {
  DB_TYPE: "mysql",
  DB_HOST: env.DB_HOST || "127.0.0.1",
  DB_PORT: Number(env.DB_PORT) || 3306,
  DB_USER: env.DB_USER || "root",
  DB_PASSWORD: env.DB_PASSWORD || "123456",
  DB_DATABASE: env.DB_DATABASE || "nest-serve",
};

const pgConfig: PgConfig = {
  DB_TYPE: "postgres",
  DB_HOST: env.DB_HOST || "127.0.0.1",
  DB_PORT: Number(env.DB_PORT) || 5432,
  DB_USER: env.DB_USER || "postgres",
  DB_PASSWORD: env.DB_PASSWORD || "123456",
  DB_DATABASE: env.DB_DATABASE || "nest-serve",
};

const sqliteConfig: SqliteConfig = {
  DB_TYPE: "sqlite",
  DB_DATABASE: join(process.cwd(), env.DB_DATABASE || "sqlitedata/nest.db"),
};

const sqliteLogger: SqliteConfig = {
  DB_TYPE: "sqlite",
  DB_DATABASE: join(process.cwd(), env.LOG_DB_DATABASE || "sqlitedata/nest-logger.db"),
};

const mysqlLogger: MysqlConfig = {
  DB_TYPE: "mysql",
  DB_HOST: env.LOG_DB_HOST || "127.0.0.1",
  DB_PORT: Number(env.LOG_DB_PORT) || 3306,
  DB_USER: env.LOG_DB_USER || "root",
  DB_PASSWORD: env.LOG_DB_PASSWORD || "123456",
  DB_DATABASE: env.LOG_DB_DATABASE || "nest-serve-logger",
};

const pgLogger: PgConfig = {
  DB_TYPE: "postgres",
  DB_HOST: env.LOG_DB_HOST || "127.0.0.1",
  DB_PORT: Number(env.LOG_DB_PORT) || 5432,
  DB_USER: env.LOG_DB_USER || "postgres",
  DB_PASSWORD: env.LOG_DB_PASSWORD || "123456",
  DB_DATABASE: env.LOG_DB_DATABASE || "nest-serve-logger",
};

let dbConfig: MysqlConfig | PgConfig | SqliteConfig;
let dbLogger: MysqlConfig | PgConfig | SqliteConfig;

const DB_TYPE = env.DB_TYPE;
const LOG_DB_TYPE = env.LOG_DB_TYPE;

dbConfig = DB_TYPE === "sqlite" ? sqliteConfig : DB_TYPE === "postgres" ? pgConfig : mysqlConfig;
dbLogger = LOG_DB_TYPE === "sqlite" ? sqliteLogger : LOG_DB_TYPE === "postgres" ? pgLogger : mysqlLogger;

export default {
  dbConfig,
  dbLogger,
};
```

#### 1.3 修改环境变量配置
**文件**：`.env.dev`、`.env.sqlitedb`

**新增配置项**：
```env
# 数据库类型：mysql | postgres | sqlite
DB_TYPE=mysql
# PostgreSQL配置
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_DATABASE=nest-serve

# 日志数据库类型：mysql | postgres | sqlite
LOG_DB_TYPE=postgres
# 日志PostgreSQL配置
LOG_DB_HOST=127.0.0.1
LOG_DB_PORT=5432
LOG_DB_USER=postgres
LOG_DB_PASSWORD=123456
LOG_DB_DATABASE=nest-serve-logger
```

#### 1.4 更新TypeORM配置
**文件**：`src/app.module.ts`

**改造内容**：
- 增加`type: "postgres"`分支处理
- PostgreSQL使用相同的配置结构

**改造后的代码**：
```typescript
useFactory: (configService: ConfigService) => {
  const dbType = DBConfig.dbConfig.DB_TYPE as "mysql" | "postgres" | "sqlite";
  if (dbType === "sqlite") {
    const config = DBConfig.dbConfig as SqliteConfig;
    return {
      type: dbType,
      database: config.DB_DATABASE,
      synchronize: process.env.NODE_ENV !== "production",
      logging: process.env.NODE_ENV !== "production",
      entities: [join(__dirname, "module/**/!(*logger)*.entity.{ts,js}")],
      migrations: ["src/migrations/**/*{.ts,.js}"],
    };
  } else if (dbType === "postgres") {
    const config = DBConfig.dbConfig as PgConfig;
    return {
      type: dbType,
      host: config.DB_HOST,
      port: config.DB_PORT,
      username: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_DATABASE,
      synchronize: process.env.NODE_ENV !== "production",
      logging: process.env.NODE_ENV !== "production",
      entities: [join(__dirname, "module/**/!(*logger)*.entity.{ts,js}")],
      migrations: ["src/migrations/**/*{.ts,.js}"],
    };
  } else {
    const config = DBConfig.dbConfig as MysqlConfig;
    return {
      type: dbType,
      host: config.DB_HOST,
      port: config.DB_PORT,
      username: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_DATABASE,
      synchronize: process.env.NODE_ENV !== "production",
      logging: process.env.NODE_ENV !== "production",
      entities: [join(__dirname, "module/**/!(*logger)*.entity.{ts,js}")],
      migrations: ["src/migrations/**/*{.ts,.js}"],
    };
  }
}
```

---

### 阶段二：缓存方案优化（优先级：最高）

#### 2.1 安装Redis依赖
```bash
npm install @nestjs/redis ioredis
npm install --save-dev @types/ioredis
```

#### 2.2 创建统一缓存服务
**文件**：`src/common/service/cache.service.ts`

**实现内容**：
- 实现缓存抽象接口
- 实现Redis缓存适配器
- 实现node-cache降级适配器
- 提供统一的缓存操作方法（get、set、del、has等）

**代码示例**：
```typescript
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import * as NodeCache from "node-cache";

export interface ICacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

@Injectable()
export class CacheService implements OnModuleInit {
  private redisClient: Redis | null = null;
  private memoryCache: NodeCache;
  private adapter: ICacheAdapter;

  constructor(private readonly configService: ConfigService) {
    this.memoryCache = new NodeCache({ stdTTL: 300 });
  }

  async onModuleInit() {
    const cacheType = process.env.CACHE_TYPE || "redis";
    
    if (cacheType === "redis") {
      try {
        this.redisClient = new Redis({
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379", 10),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || "0", 10),
        });
        
        await this.redisClient.ping();
        this.adapter = new RedisAdapter(this.redisClient);
        console.log("Redis缓存已启用");
      } catch (error) {
        console.warn("Redis连接失败，降级使用内存缓存", error);
        this.adapter = new MemoryAdapter(this.memoryCache);
      }
    } else {
      this.adapter = new MemoryAdapter(this.memoryCache);
      console.log("内存缓存已启用");
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return this.adapter.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    return this.adapter.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    return this.adapter.del(key);
  }

  async has(key: string): Promise<boolean> {
    return this.adapter.has(key);
  }
}

class RedisAdapter implements ICacheAdapter {
  constructor(private readonly redisClient: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redisClient.setex(key, ttl, serialized);
    } else {
      await this.redisClient.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async has(key: string): Promise<boolean> {
    return (await this.redisClient.exists(key)) === 1;
  }
}

class MemoryAdapter implements ICacheAdapter {
  constructor(private readonly cache: NodeCache) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key) || null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    this.cache.del(key);
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
}
```

#### 2.3 创建缓存配置文件
**文件**：`src/config/cache.ts`

**代码示例**：
```typescript
export interface CacheConfig {
  enabled: boolean;
  type: "redis" | "memory";
  redis?: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
}

export const cacheConfig: CacheConfig = {
  enabled: process.env.CACHE_ENABLED !== "false",
  type: (process.env.CACHE_TYPE as "redis" | "memory") || "redis",
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0", 10),
  },
};
```

#### 2.4 创建缓存模块
**目录**：`src/module/cache/`
**文件**：`cache.module.ts`

**代码示例**：
```typescript
import { Module, Global } from "@nestjs/common";
import { CacheService } from "@/common/service/cache.service";

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
```

#### 2.5 替换现有缓存使用
**文件**：`src/config/nodeCache.ts` → 删除，改为使用统一缓存服务

**文件**：`src/module/users/users.service.ts`
**改造内容**：
- 删除`import { emailCache, svgCache } from "@/config/nodeCache"`
- 注入`CacheService`
- 替换所有`emailCache`和`svgCache`的使用

**改造示例**：
```typescript
import { CacheService } from "@/common/service/cache.service";

@Injectable()
export class UsersService extends BaseService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService
  ) {
    super();
  }

  async captcha(captchaDto: CaptchaDto): Promise<ApiResult<Captcha | null>> {
    try {
      const options = {
        size: 4,
        ignoreChars: "10ol",
        noise: 3,
        color: true,
        background: captchaDto.background || "#fff",
        width: Number(captchaDto.width) || 150,
        height: Number(captchaDto.height) || 50,
        fontSize: Number(captchaDto.fontSize) || 50,
      };

      const { text, data } = svgCaptcha.create(options);
      const base64 = Buffer.from(data).toString("base64");
      const url = `data:image/svg+xml;base64,${base64}`;
      const codeKey = uuidv4();
      
      await this.cacheService.set(codeKey, { text }, 300); // 5分钟过期
      
      return ApiResult.success<Captcha>({
        data: {
          url,
          codeKey,
        },
      });
    } catch (error) {
      return ApiResult.error<null>(error || "生成验证码失败！");
    }
  }

  async VerificationCodeLogin(
    verificationCodeLogin: VerificationCodeLoginDto,
    platform: string = "admin"
  ): Promise<ApiResult<UserLogin | null>> {
    try {
      let data = await this.userRepository.findOne({
        where: { email: verificationCodeLogin.email, platform },
        relations: ["roles"],
      });
      if (!data) {
        return ApiResult.error<null>("邮箱不存在");
      }
      
      const cacheData: EmailCahce = await this.cacheService.get(verificationCodeLogin.email);
      if (cacheData?.code !== verificationCodeLogin.emailCode) {
        return ApiResult.error<null>("验证码错误或已过期");
      }
      
      await this.cacheService.del(verificationCodeLogin.email);

      if (data.status === 2) {
        return ApiResult.error<null>("当前账号已被禁用，请联系管理员！");
      }
      
      let { password, deletedAt, platform: userPlatform, ...info } = data;

      let options = getPlatformJwtConfig(platform) as JwtConfig;
      let userInfo = {
        userInfo: {
          ...info,
          createdAt: this.dayjs(info.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: this.dayjs(info.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
        },
        token_type: "Bearer ",
        access_token: this.jwtService.sign(info, {
          secret: options.secret,
          expiresIn: options.jwt_expires_in,
        }),
        refresh_token: this.jwtService.sign(
          { id: info.id },
          {
            secret: options.secret,
            expiresIn: options.jwt_refresh_expires_in,
          }
        ),
      };
      return ApiResult.success<UserLogin>({ data: userInfo });
    } catch (error) {
      return ApiResult.error<null>(error || "用户登录失败，请稍后再试");
    }
  }
}
```

**文件**：`src/module/email/email.service.ts`
**改造内容**：替换所有`emailCache`的使用

#### 2.6 更新环境变量配置
**文件**：`.env.dev`、`.env.sqlitedb`

**新增配置项**：
```env
# 缓存配置
CACHE_ENABLED=true
CACHE_TYPE=redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

### 阶段三：API规范化改造（优先级：最高）

#### 3.1 用户管理模块改造
**文件**：`src/module/users/users.controller.ts`

**接口对照表**：

| 当前接口 | 规范后接口 | HTTP方法 | 说明 |
|---------|------------|----------|------|
| `POST /api/v1/admin/users/create/:platform` | `POST /api/v1/admin/users` | POST | 创建用户，platform从请求体获取 |
| `GET /api/v1/admin/users/page/:platform` | `GET /api/v1/admin/users` | GET | 分页查询，platform从请求头获取 |
| `GET /api/v1/admin/users/all/:platform` | `GET /api/v1/admin/users/all` | GET | 查询所有，platform从请求头获取 |
| `GET /api/v1/admin/users/info/:id` | `GET /api/v1/admin/users/:id` | GET | 查询详情 |
| `PATCH /api/v1/admin/users/update/:id` | `PATCH /api/v1/admin/users/:id` | PATCH | 更新用户 |
| `DELETE /api/v1/admin/users/delete/:id` | `DELETE /api/v1/admin/users/:id` | DELETE | 删除用户 |
| `GET /api/v1/admin/users/export/:platform` | `GET /api/v1/admin/users/export` | GET | 导出用户，platform从请求头获取 |
| `POST /api/v1/admin/users/logIn` | `POST /api/v1/admin/users/login` | POST | 用户登录 |
| `POST /api/v1/admin/users/logIn/setCookie` | `POST /api/v1/admin/users/login/set-cookie` | POST | 登录设置Cookie |
| `POST /api/v1/admin/users/logIn/verificationCode` | `POST /api/v1/admin/users/login/verification-code` | POST | 邮箱验证码登录 |
| `GET /api/v1/admin/users/refresh/token` | `GET /api/v1/admin/users/refresh-token` | GET | 刷新token |
| `GET /api/v1/admin/users/logout` | `POST /api/v1/admin/users/logout` | POST | 退出登录 |
| `GET /api/v1/admin/users/captcha` | `GET /api/v1/admin/users/captcha` | GET | 获取验证码 |

**改造要点**：
1. platform参数改为从请求头`X-Platform`或请求体中获取
2. 使用标准HTTP方法
3. 使用连字符分隔URL中的单词
4. 查询参数使用小驼峰命名（如`pageSize`、`userName`）
5. 响应状态码：创建成功返回201，删除成功返回204

**改造后的代码示例**：
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, Headers } from "@nestjs/common";
import { UsersService } from "./users.service";
import {
  CreateUserDto,
  UpdateUserDto,
  FindUserDto,
  FindUserDtoByPage,
  LogInDto,
  VerificationCodeLoginDto,
  CaptchaDto,
} from "./dto/index";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";
import { Request, Response } from "express";
import { ApiResult } from "@/common/utils/result";
import { UserLogin } from "@/types/user";

@ApiTags("用户管理")
@ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "创建成功" })
@ApiResponse({ status: 204, description: "删除成功" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("api/v1/admin/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "创建用户" })
  create(
    @Headers("x-platform") platform: string,
    @Body() createUserDto: CreateUserDto
  ) {
    return this.usersService.create(createUserDto, platform);
  }

  @Get()
  @ApiOperation({ summary: "查询用户列表(分页)" })
  findByPage(
    @Headers("x-platform") platform: string,
    @Query(new FilterEmptyPipe()) findUserDtoByPage: FindUserDtoByPage
  ) {
    return this.usersService.findByPage(findUserDtoByPage, platform);
  }

  @Get("all")
  @ApiOperation({ summary: "查询用户列表(不分页)" })
  findAll(
    @Headers("x-platform") platform: string,
    @Query(new FilterEmptyPipe()) findUserDto: FindUserDto
  ) {
    return this.usersService.findAll(findUserDto, platform);
  }

  @Get(":id")
  @ApiOperation({ summary: "查询用户详情" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新用户信息" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除用户" })
  @HttpCode(204)
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @Post("login")
  @ApiOperation({ summary: "用户登录" })
  logIn(@Body() loginDto: LogInDto) {
    return this.usersService.logIn(loginDto, "admin");
  }

  @Post("login/set-cookie")
  @ApiOperation({ summary: "用户登录(设置Cookie)" })
  async logInSetCookie(@Body() loginDto: LogInDto, @Res() res: Response) {
    let { __isApiResult, ...data } = await this.usersService.logIn(loginDto, "admin");
    if (data.code == 200) {
      const options = getPlatformJwtConfig("admin") as JwtConfig;
      res.cookie("token", (data?.data as UserLogin).access_token, { maxAge: Number(options.jwt_expires_in) });
      res.cookie("refresh_token", (data?.data as UserLogin).refresh_token, {
        maxAge: Number(options.jwt_refresh_expires_in),
      });
      res.status(data.code).json(data);
      return data;
    } else {
      res.status(data.code).json(data);
    }
  }

  @Post("login/verification-code")
  @ApiOperation({ summary: "邮箱验证码登录" })
  async verificationCodeLogin(@Body() verificationCodeLogin: VerificationCodeLoginDto) {
    return this.usersService.VerificationCodeLogin(verificationCodeLogin, "admin");
  }

  @Get("refresh-token")
  @ApiOperation({ summary: "刷新token" })
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    let refresh_token: string | undefined;
    if (req.cookies && req.cookies.refresh_token) {
      refresh_token = req.cookies.refresh_token;
    }
    if (!refresh_token) {
      refresh_token = (req.headers["refresh_token"] as string)?.split(" ")[1];
    }
    if (!refresh_token) {
      res.status(401).json({ code: 401, message: "refreshToken不存在，请先登录！", data: null });
    }
    let { __isApiResult, ...data } = await this.usersService.refreshToken(refresh_token, "admin");
    if (data.code == 200) {
      const options = getPlatformJwtConfig("admin") as JwtConfig;
      res.cookie("token", (data?.data as UserLogin).access_token, { maxAge: Number(options.jwt_expires_in) });
    }
    res.status(data.code).json(data);
    return data;
  }

  @Post("logout")
  @ApiOperation({ summary: "退出登录清除Cookie" })
  @HttpCode(204)
  logout(@Res() res: Response) {
    res.cookie("token", "", { expires: new Date(0) });
    res.cookie("refresh_token", "", { expires: new Date(0) });
  }

  @Get("export")
  @ApiOperation({ summary: "导出用户数据" })
  @Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  async exportUsers(
    @Headers("x-platform") platform: string,
    @Query(new FilterEmptyPipe()) findUserDtoByPage: FindUserDtoByPage,
    @Res() res: Response
  ) {
    const data = await this.usersService.exportUserList(findUserDtoByPage, platform);
    if ("buffer" in data) {
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(data.fileName)}"`);
      res.setHeader("Access-Control-Expose-Headers", `Content-Disposition`);
      res.status(200).send(data.buffer);
      return;
    }
    const { __isApiResult, ...dataResult } = data as ApiResult<null>;
    return dataResult;
  }

  @Get("captcha")
  @ApiOperation({ summary: "获取验证码" })
  async captcha(@Query(new FilterEmptyPipe()) captchaDto: CaptchaDto) {
    return await this.usersService.captcha(captchaDto);
  }
}
```

#### 3.2 路由管理模块改造
**文件**：`src/module/routes/routes.controller.ts`

**接口对照表**：

| 当前接口 | 规范后接口 | HTTP方法 | 说明 |
|---------|------------|----------|------|
| `POST /api/v1/admin/routes/create/:platform` | `POST /api/v1/admin/routes` | POST | 创建路由，platform从请求体获取 |
| `GET /api/v1/admin/routes/all/:platform` | `GET /api/v1/admin/routes/all` | GET | 查询所有路由，platform从请求头获取 |
| `GET /api/v1/admin/routes/info/:id` | `GET /api/v1/admin/routes/:id` | GET | 查询路由详情 |
| `PATCH /api/v1/admin/routes/update/:id` | `PATCH /api/v1/admin/routes/:id` | PATCH | 更新路由 |
| `DELETE /api/v1/admin/routes/delete/:id` | `DELETE /api/v1/admin/routes/:id` | DELETE | 删除路由 |
| `GET /api/v1/admin/routes/by/role` | `GET /api/v1/admin/routes/by-role` | GET | 根据角色获取路由 |

#### 3.3 其他模块改造
**需要改造的文件列表**：
- `src/module/roles/roles.controller.ts`
- `src/module/logger/logger.controller.ts`
- `src/module/email/email.controller.ts`
- `src/module/notice/notice.controller.ts`
- `src/module/dictionary/dictionary.controller.ts`
- `src/module/upload/upload.controller.ts`

**改造要点**：
- 统一接口命名规范（使用连字符）
- 使用标准HTTP方法（GET/POST/PATCH/DELETE）
- platform参数改为从请求头获取
- 查询参数使用小驼峰命名
- 响应状态码：创建成功返回201，删除成功返回204

#### 3.4 响应格式统一
**文件**：`src/common/utils/result.ts`

**按照RESTful规范调整响应格式**：

**成功响应**：
```typescript
{
  code: 200,
  message: "操作成功",
  data: { /* 响应数据 */ },
  timestamp: "2023-01-01T00:00:00.000Z"
}
```

**分页响应**：
```typescript
{
  code: 200,
  message: "操作成功",
  data: {
    items: [ /* 数据列表 */ ],
    total: 100,
    page: 1,
    pageSize: 10,
    pages: 10
  },
  timestamp: "2023-01-01T00:00:00.000Z"
}
```

**错误响应**：
```typescript
{
  code: 400,
  message: "请求参数错误",
  data: {
    errors: [
      {
        field: "userName",
        message: "用户名不能为空"
      }
    ]
  },
  timestamp: "2023-01-01T00:00:00.000Z"
}
```

#### 3.5 状态码统一
- 创建成功：201
- 删除成功：204
- 参数错误：400
- 未授权：401
- 权限不足：403
- 资源不存在：404
- 服务器错误：500

#### 3.6 白名单更新
**文件**：`src/config/whiteList.ts`

**更新内容**：
- 更新所有白名单路径，使用新的接口路径
- 更新登录接口路径：`/api/v1/admin/users/login`

---

### 阶段四：文档体系建设（优先级：中）

#### 4.1 创建文档目录结构
```
doc/
├── requirements/          # 需求文档
│   ├── 000.大纲.md
│   └── 001.需求文档_v1.md
├── design/               # 设计文档
│   ├── 000.大纲.md
│   ├── 001.数据库设计_v1.md
│   └── 002.接口设计_v1.md
├── technical/            # 技术文档
│   ├── 000.大纲.md
│   ├── 001.技术架构_v1.md
│   ├── 002.数据库配置_v1.md
│   └── 003.缓存方案_v1.md
├── api/                 # API文档
│   ├── 000.大纲.md
│   ├── 001.用户管理API_v1.md
│   └── 002.路由管理API_v1.md
├── deployment/           # 部署文档
│   ├── 000.大纲.md
│   ├── 001.本地部署_v1.md
│   └── 002.生产部署_v1.md
├── development/          # 开发文档
│   ├── 000.大纲.md
│   └── 001.开发规范_v1.md
└── log.md               # 重大更新日志
```

#### 4.2 编写核心文档
- 需求文档：记录项目需求和功能说明
- 数据库设计文档：记录数据库表结构和关系
- 技术架构文档：记录技术栈和架构设计
- 数据库配置文档：记录MySQL、PostgreSQL、SQLite配置方法
- 缓存方案文档：记录Redis和node-cache使用方法
- 开发规范文档：记录代码规范和开发流程
- 部署文档：记录本地和生产环境部署方法

#### 4.3 创建文档规则配置
**文件**：`.doc-rules.json`

**代码示例**：
```json
{
  "version": "1.0.0",
  "createdAt": "2026-01-12",
  "updatedAt": "2026-01-12",
  "docs": [
    {
      "path": "doc/requirements/",
      "versionControl": true
    },
    {
      "path": "doc/design/",
      "versionControl": true
    },
    {
      "path": "doc/technical/",
      "versionControl": true
    },
    {
      "path": "doc/api/",
      "versionControl": true
    },
    {
      "path": "doc/deployment/",
      "versionControl": true
    },
    {
      "path": "doc/development/",
      "versionControl": true
    }
  ]
}
```

---

## 三、执行顺序

### 第一阶段：数据库兼容性改造（2-3天）
1. 安装PostgreSQL依赖
2. 修改数据库配置文件
3. 修改环境变量配置
4. 更新TypeORM配置
5. 测试PostgreSQL连接

### 第二阶段：缓存方案优化（3-4天）
1. 安装Redis依赖
2. 创建统一缓存服务
3. 创建缓存配置文件
4. 创建缓存模块
5. 替换现有缓存使用
6. 更新环境变量配置
7. 测试Redis和降级机制

### 第三阶段：API规范化改造（5-7天）
1. 改造用户管理模块
2. 改造路由管理模块
3. 改造角色管理模块
4. 改造日志管理模块
5. 改造邮箱管理模块
6. 改造通知管理模块
7. 改造数据字典模块
8. 改造文件上传模块
9. 统一响应格式
10. 更新白名单
11. 测试所有接口

### 第四阶段：文档体系建设（3-4天）
1. 创建文档目录结构
2. 编写需求文档
3. 编写数据库设计文档
4. 编写技术架构文档
5. 编写数据库配置文档
6. 编写缓存方案文档
7. 编写开发规范文档
8. 编写部署文档
9. 创建文档规则配置

---

## 四、预期成果

1. **数据库兼容性**：支持MySQL、PostgreSQL、SQLite三种数据库
2. **缓存方案优化**：优先使用Redis，不可用时降级使用node-cache
3. **API规范化**：所有接口符合RESTful API规范
4. **完善的文档体系**：覆盖需求、设计、技术、API、部署等各个方面

---

## 五、注意事项

1. **向后兼容**：在改造过程中尽量保持向后兼容，避免影响现有功能
2. **充分测试**：每个阶段完成后都要进行充分测试
3. **文档同步**：改造过程中及时更新相关文档
4. **团队协作**：与前端团队保持沟通，确保API改造同步进行
5. **分步实施**：按照计划逐步推进，每个阶段完成后再进行下一阶段