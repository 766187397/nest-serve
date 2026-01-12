# RESTful API 规范

## 1. RESTful API 概述

REST（Representational State Transfer）是一种软件架构风格，用于设计网络应用程序。RESTful API 是遵循 REST 原则的 API，具有以下核心特点：

- **资源为中心**：所有操作都围绕资源进行
- **使用 HTTP 方法表示操作**：GET/POST/PUT/PATCH/DELETE 等
- **无状态通信**：服务器不保存客户端状态
- **统一资源标识符（URI）**：每个资源都有唯一的标识符
- **自描述消息**：请求和响应包含足够的信息来描述其内容
- **HATEOAS（可选）**：提供资源之间的链接关系

## 2. RESTful API 设计规范

### 2.1 URL 设计规范

- **使用名词表示资源**：避免使用动词，如 `/api/users` 而不是 `/api/getUsers`
- **资源名称使用复数**：如 `/api/users` 而不是 `/api/user`
- **使用小写字母**：避免大小写混合，如 `/api/user-profiles` 而不是 `/api/UserProfiles`
- **使用连字符分隔单词**：如 `/api/user-profiles` 而不是 `/api/user_profiles`
- **层级结构清晰**：使用嵌套结构表示资源关系，如 `/api/users/123/orders`
- **包含版本号**：如 `/api/v1/users`，便于 API 演进

### 2.2 HTTP 方法使用规范

| HTTP 方法 | 操作类型 | 幂等性 | 安全性 | 适用场景 |
|---------|----------|--------|--------|----------|
| GET | 读取 | 是 | 是 | 获取资源列表或单个资源 |
| POST | 创建 | 否 | 否 | 创建新资源 |
| PUT | 更新（全量） | 是 | 否 | 替换整个资源 |
| PATCH | 更新（部分） | 是 | 否 | 更新资源的部分字段 |
| DELETE | 删除 | 是 | 否 | 删除资源 |

### 2.3 状态码规范

| 状态码 | 类别 | 含义 | 示例 |
|--------|------|------|------|
| 200 | 成功 | OK | GET 请求成功 |
| 201 | 成功 | Created | POST 请求成功，资源已创建 |
| 204 | 成功 | No Content | DELETE 请求成功，无返回内容 |
| 400 | 客户端错误 | Bad Request | 请求参数错误 |
| 401 | 客户端错误 | Unauthorized | 未授权，缺少认证信息 |
| 403 | 客户端错误 | Forbidden | 禁止访问，权限不足 |
| 404 | 客户端错误 | Not Found | 资源不存在 |
| 500 | 服务器错误 | Internal Server Error | 服务器内部错误 |

### 2.4 请求格式规范

#### 2.4.1 查询参数

- 用于 GET 请求中传递过滤、排序、分页等参数
- 使用小驼峰命名法，如 `pageSize`、`userName`
- 示例：`GET /api/v1/users?page=1&pageSize=10&userName=admin`

#### 2.4.2 请求体

- 用于 POST、PUT、PATCH 请求中传递资源数据
- 使用 JSON 格式
- 示例：
  ```json
  {
    "userName": "admin",
    "email": "admin@example.com",
    "status": 1
  }
  ```

### 2.5 响应格式规范

#### 2.5.1 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { /* 响应数据 */ },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### 2.5.2 分页响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [ /* 数据列表 */ ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "pages": 10
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

#### 2.5.3 错误响应

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": {
    "errors": [
      {
        "field": "userName",
        "message": "用户名不能为空"
      }
    ]
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 3. 核心 API 示例

以下示例以用户管理（User）为例，展示 RESTful API 的典型用法：

### 3.1 按 ID 查询详情（GET）

**接口描述**：根据 ID 获取单个用户详情

**请求**：
```
GET /api/v1/users/123
Accept: application/json
```

**响应**：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 123,
    "userName": "admin",
    "email": "admin@example.com",
    "status": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 3.2 分页查询（GET）

**接口描述**：获取用户列表，支持分页、过滤、排序

**请求**：
```
GET /api/v1/users?page=1&pageSize=10&userName=admin&status=1&sortBy=createdAt&sortOrder=desc
Accept: application/json
```

**响应**：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "items": [
      {
        "id": 123,
        "userName": "admin",
        "email": "admin@example.com",
        "status": 1,
        "createdAt": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": 124,
        "userName": "admin_user",
        "email": "admin_user@example.com",
        "status": 1,
        "createdAt": "2023-01-02T00:00:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 10,
    "pages": 15
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 3.3 无分页查询所有（GET）

**接口描述**：获取所有用户列表（适用于数据量较小的场景）

**请求**：
```
GET /api/v1/users/all
Accept: application/json
```

**响应**：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 123,
      "userName": "admin",
      "email": "admin@example.com",
      "status": 1,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 124,
      "userName": "user1",
      "email": "user1@example.com",
      "status": 1,
      "createdAt": "2023-01-02T00:00:00.000Z"
    }
  ],
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### 3.4 新增资源（POST）

**接口描述**：创建新用户

**请求**：
```
POST /api/v1/users
Content-Type: application/json
Accept: application/json

{
  "userName": "newuser",
  "email": "newuser@example.com",
  "password": "123456",
  "status": 1
}
```

**响应**：
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 125,
    "userName": "newuser",
    "email": "newuser@example.com",
    "status": 1,
    "createdAt": "2023-01-03T00:00:00.000Z",
    "updatedAt": "2023-01-03T00:00:00.000Z"
  },
  "timestamp": "2023-01-03T00:00:00.000Z"
}
```

### 3.5 按 ID 删除单个（DELETE）

**接口描述**：根据 ID 删除单个用户

**请求**：
```
DELETE /api/v1/users/123
Accept: application/json
```

**响应**：
```json
{
  "code": 204,
  "message": "删除成功",
  "data": null,
  "timestamp": "2023-01-03T00:00:00.000Z"
}
```

### 3.6 按 IDs 删除多个（DELETE）

**接口描述**：根据 ID 列表批量删除用户

**请求**：
```
DELETE /api/v1/users
Content-Type: application/json
Accept: application/json

{
  "ids": [123, 124, 125]
}
```

**响应**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "successCount": 3,
    "failCount": 0
  },
  "timestamp": "2023-01-03T00:00:00.000Z"
}
```

### 3.7 按 ID 更新单个（PUT）

**接口描述**：根据 ID 全量更新用户信息

**请求**：
```
PUT /api/v1/users/123
Content-Type: application/json
Accept: application/json

{
  "userName": "admin_updated",
  "email": "admin_updated@example.com",
  "status": 0
}
```

**响应**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 123,
    "userName": "admin_updated",
    "email": "admin_updated@example.com",
    "status": 0,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-03T00:00:00.000Z"
  },
  "timestamp": "2023-01-03T00:00:00.000Z"
}
```

## 4. 扩展 API 示例

### 4.1 部分字段更新（PATCH）

**接口描述**：根据 ID 更新用户的部分字段

**请求**：
```
PATCH /api/v1/users/123
Content-Type: application/json
Accept: application/json

{
  "email": "admin_new@example.com"
}
```

**响应**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 123,
    "userName": "admin_updated",
    "email": "admin_new@example.com",
    "status": 0,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-03T00:00:00.000Z"
  },
  "timestamp": "2023-01-03T00:00:00.000Z"
}
```

### 4.2 批量新增（POST）

**接口描述**：批量创建用户

**请求**：
```
POST /api/v1/users/batch
Content-Type: application/json
Accept: application/json

[
  {
    "userName": "user2",
    "email": "user2@example.com",
    "password": "123456",
    "status": 1
  },
  {
    "userName": "user3",
    "email": "user3@example.com",
    "password": "123456",
    "status": 1
  }
]
```

**响应**：
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "successCount": 2,
    "failCount": 0,
    "ids": [126, 127]
  },
  "timestamp": "2023-01-03T00:00:00.000Z"
}
```

### 4.3 状态切换（PATCH）

**接口描述**：切换用户状态

**请求**：
```
PATCH /api/v1/users/123/status
Content-Type: application/json
Accept: application/json

{
  "status": 1
}
```

**响应**：
```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "id": 123,
    "status": 1,
    "updatedAt": "2023-01-03T00:00:00.000Z"
  },
  "timestamp": "2023-01-03T00:00:00.000Z"
}
```

### 4.4 搜索功能（GET）

**接口描述**：根据关键词搜索用户

**请求**：
```
GET /api/v1/users/search?keyword=admin&fields=userName,email
Accept: application/json
```

**响应**：
```json
{
  "code": 200,
  "message": "搜索成功",
  "data": [
    {
      "id": 123,
      "userName": "admin_updated",
      "email": "admin_new@example.com",
      "status": 1
    }
  ],
  "timestamp": "2023-01-03T00:00:00.000Z"
}
```

### 4.5 关联资源查询（GET）

**接口描述**：获取用户的关联资源（如订单）

**请求**：
```
GET /api/v1/users/123/orders
Accept: application/json
```

**响应**：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "userId": 123,
    "userName": "admin_updated",
    "orders": [
      {
        "id": 456,
        "orderNo": "ORD-2023-001",
        "amount": 100.00,
        "status": "paid",
        "createdAt": "2023-01-04T00:00:00.000Z"
      }
    ]
  },
  "timestamp": "2023-01-03T00:00:00.000Z"
}
```

### 4.6 导入功能（POST）

**接口描述**：批量导入用户数据

**请求**：
```
POST /api/v1/users/import
Content-Type: multipart/form-data
Accept: application/json

file: [Excel文件]
```

**响应**：
```json
{
  "code": 200,
  "message": "导入成功",
  "data": {
    "total": 100,
    "successCount": 95,
    "failCount": 5,
    "failList": [
      {
        "row": 5,
        "error": "邮箱格式错误"
      }
    ]
  },
  "timestamp": "2023-01-03T00:00:00.000Z"
}
```

### 4.7 导出功能（GET）

**接口描述**：导出用户数据

**请求**：
```
GET /api/v1/users/export?status=1
Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

**响应**：
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="users-20230103.xlsx"

[Excel文件二进制数据]
```

## 5. RESTful API 最佳实践

### 5.1 设计原则

1. **资源为中心**：所有操作都围绕资源进行设计
2. **清晰的命名**：URL 应该直观、易于理解
3. **统一的响应格式**：所有 API 返回统一的 JSON 格式
4. **充分利用 HTTP 方法**：正确使用 GET/POST/PUT/PATCH/DELETE
5. **合理的状态码**：使用标准的 HTTP 状态码
6. **无状态设计**：服务器不保存客户端状态
7. **版本控制**：通过 URL 或请求头包含版本信息

### 5.2 安全性考虑

1. **认证授权**：使用 JWT、OAuth2.0 等进行身份验证
2. **HTTPS**：所有 API 都应该使用 HTTPS 协议
3. **输入验证**：严格验证所有输入参数
4. **防止 SQL 注入**：使用参数化查询或 ORM
5. **防止 XSS 攻击**：对输出进行转义
6. **防止 CSRF 攻击**：使用 CSRF 令牌
7. **接口限流**：防止恶意请求
8. **敏感数据加密**：对敏感数据进行加密存储

### 5.3 性能优化

1. **分页查询**：所有列表查询都应该支持分页
2. **缓存策略**：对热点数据进行缓存
3. **减少请求次数**：合理设计 API，减少客户端请求次数
4. **压缩响应数据**：使用 Gzip 或 Brotli 压缩响应
5. **优化数据库查询**：合理使用索引，避免全表扫描
6. **异步处理**：对耗时操作使用异步处理

### 5.4 文档和测试

1. **自动生成文档**：使用 Swagger 或 OpenAPI 自动生成 API 文档
2. **详细的示例**：为每个 API 提供详细的请求响应示例
3. **单元测试**：为 API 编写单元测试
4. **集成测试**：测试 API 之间的交互
5. **性能测试**：测试 API 的性能和并发能力

## 6. 常见错误和陷阱

### 6.1 错误的 URL 设计

- 使用动词而不是名词：如 `/api/getUsers` 应该改为 `/api/users`
- 复杂的嵌套结构：如 `/api/users/123/orders/456/items/789` 应该简化
- 大小写混合：如 `/api/UserProfiles` 应该改为 `/api/user-profiles`

### 6.2 错误的 HTTP 方法使用

- 使用 GET 方法修改资源
- 使用 POST 方法获取资源
- 使用 PUT 方法进行部分更新（应该使用 PATCH）

### 6.3 错误的状态码使用

- 所有错误都返回 500
- 使用错误的状态码类别
- 不返回具体的错误信息

### 6.4 缺少版本控制

- 没有版本号，导致 API 升级困难
- 使用不兼容的 API 变更

### 6.5 不安全的设计

- 返回敏感数据
- 缺少认证授权
- 没有输入验证

## 7. 总结

RESTful API 是一种设计风格，而不是严格的标准。遵循 REST 原则可以设计出更加清晰、易用、可扩展的 API。在实际开发中，应该根据具体业务场景灵活调整，但始终保持 API 的一致性和规范性。

通过本文档的规范和示例，希望能够帮助开发者设计出更加符合 REST 原则的 API，提高系统的可维护性和可扩展性。