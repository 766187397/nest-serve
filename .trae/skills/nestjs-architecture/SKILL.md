---
name: "nestjs-architecture"
description: "提供NestJS架构与工程化支持，包括现代后端工程化、开发流程规范、项目结构规范、日志管理、部署与运维等。当用户需要NestJS架构设计指导、工程化配置建议或部署策略支持时调用。"
---

# NestJS 架构与工程化

## 技能描述

提供NestJS架构与工程化支持，包括现代后端工程化、开发流程规范、项目结构规范、日志管理、部署与运维等。

## 适用场景

- 设计NestJS项目的架构
- 制定NestJS项目的开发规范
- 优化NestJS项目的工程化配置
- 指导NestJS项目的结构组织和部署

## 核心内容

### 现代后端工程化

#### 数据库
- TypeORM
- Prisma
- Mongoose
- 数据库迁移
- 数据填充

#### 缓存
- Redis缓存策略
- 缓存失效
- 缓存穿透/击穿/雪崩防护
- 多级缓存

#### 消息队列
- RabbitMQ
- Kafka
- Bull队列
- 后台任务处理

#### API文档
- Swagger/OpenAPI规范
- 接口文档生成
- 文档版本管理

#### 日志管理
- Winston日志库
- Pino日志库
- 日志级别
- 日志格式
- 日志存储

#### 监控与追踪
- Prometheus
- Grafana
- Jaeger
- 性能指标监控
- 分布式追踪

#### CI/CD
- GitHub Actions
- GitLab CI
- Jenkins
- 持续集成流程
- 持续部署流程

#### 环境配置
- 多环境配置管理（开发、测试、生产）
- 环境变量管理
- 配置文件组织

#### 容器化
- Docker
- Docker Compose
- Kubernetes
- 容器编排

### 开发流程规范

#### 代码编写前检查
- `/src/modules`中是否已有对应的模块
- `/src/common`中是否有封装好的通用组件
- `/src/utils`中是否有封装好的工具函数
- `/src/config`中是否有对应的配置项
- `package.json`中是否安装了对应的依赖库
- `/src/database`中是否已有对应的实体/模型

#### 库的选择与使用
优先考虑成熟的库，考虑：
- 社区活跃度和维护状态
- 文档完善程度
- TypeScript支持情况
- 性能表现
- 兼容性
- 学习成本
- 安全性

#### 模块与函数封装
- 优先考虑复用性
- 模块封装
- 函数抽离
- 通用模块设计
- JSDoc注释

#### 代码注释标准
- 使用JSDoc语法
- 包含中文描述
- 说明参数类型、返回值类型
- 提供使用示例
- 说明注意事项

### 项目结构规范

#### 目录结构
```
src/
├── common/              # 通用模块
│   ├── decorators/      # 自定义装饰器
│   ├── filters/         # 异常过滤器
│   ├── guards/          # 守卫
│   ├── interceptors/    # 拦截器
│   ├── pipes/           # 管道
├── config/              # 配置文件
├── database/            # 数据库相关
│   ├── migrations/      # 数据库迁移
│   └── seeds/           # 数据填充
├── modules/             # 业务模块
│   ├── user/            # 用户模块
│   ├── auth/            # 认证模块
├── utils/               # 工具函数
├── app.module.ts        # 根模块
└── main.ts              # 入口文件
```

#### 文件命名规范
- 模块文件：kebab-case（如：user.module.ts）
- 控制器文件：*.controller.ts（如：user.controller.ts）
- 服务文件：*.service.ts（如：user.service.ts）
- DTO文件：*.dto.ts（如：create-user.dto.ts）
- 实体文件：*.entity.ts（如：user.entity.ts）
- 工具函数文件：camelCase（如：dateHelper.ts）

#### 模块结构规范
每个业务模块应包含：
- `*.module.ts` - 模块定义
- `*.controller.ts` - 控制器
- `*.service.ts` - 服务
- `*.dto.ts` - 数据传输对象
- `*.entity.ts` - 数据库实体
- `*.spec.ts` - 测试文件

### 功能模块组织
**强制要求**：所有业务功能模块的源代码必须统一放在 `src/modules` 目录下，严禁在其他位置创建功能模块。

#### 模块定义
以下内容必须作为独立模块放在 `src/modules` 目录下：
- 业务功能模块（如：用户管理、订单管理、商品管理等）
- 包含Controller的业务功能
- 包含Service的业务逻辑
- 包含Entity的数据模型
- 包含DTO的数据传输对象

#### 目录结构规范
```
src/modules/
├── user/                    # 用户模块
│   ├── user.modules.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.entity.ts
│   └── dto/
│       ├── request.dto.ts
│       ├── response.dto.ts
│       └── index.ts
├── order/                   # 订单模块
│   └── ...
└── product/                 # 商品模块
    └── ...
```

#### 创建新功能时的检查清单
在创建任何新功能前，必须按以下步骤检查：
1. **第一步**：确认是否为业务功能模块（是→继续，否→考虑放入src/common或src/utils）
2. **第二步**：在 `src/modules` 目录下创建对应的模块文件夹
3. **第三步**：按照目录结构规范创建必要的文件（modules、controller、service、entity、dto）
4. **第四步**：将模块注册到 `app.modules.ts` 或对应的父模块中

#### 禁止行为
- ❌ 禁止在 `src` 根目录直接创建业务模块文件
- ❌ 禁止在 `src/common` 中创建业务功能模块
- ❌ 禁止在 `src/config` 中创建业务功能模块
- ❌ 禁止在 `src/utils` 中创建业务功能模块
- ❌ 禁止在项目根目录创建业务模块文件夹

### DTO文件组织

#### 目录结构
```
src/modules/{模块名}/dto/
├── request.dto.ts    # 请求DTO
├── response.dto.ts   # 响应DTO
└── index.ts          # 统一导出
```

#### 命名规范
- 请求DTO：动词+名词+Dto（CreateUserDto、UpdateUserDto、QueryUserDto、DeleteUserDto、LoginUserDto）
- 响应DTO：实体名+场景+Response+Dto（UserResponseDto、UserListResponseDto、UserPageResponseDto、UserStatResponseDto）
- 统一要求：PascalCase、以Dto结尾、避免缩写、实体名与数据库一致

### 部署与运维

#### 环境配置
- 开发环境
- 测试环境
- 生产环境
- 环境变量管理

#### 部署策略
- 容器化部署
- 传统部署
- 云服务部署
- 多实例部署

#### 监控与告警
- 应用监控
- 数据库监控
- 系统监控
- 告警配置

#### 故障排查
- 日志分析
- 性能分析
- 错误定位
- 恢复策略

#### 扩展性
- 水平扩展
- 垂直扩展
- 服务拆分
- 负载均衡