# 项目规则配置

## 1. 代码变更验证
在任何新增、修改等操作后，都需要执行打包命令查看终端是否有错误，确保代码质量。

## 2. 接口测试验证
**强制要求**：接口开发完成后必须进行测试验证，确保接口功能正常。

### 2.1 测试流程
接口开发完成后，按以下步骤进行测试：
1. **第一步**：将新开发的接口路径加入到白名单配置中（白名单配置文件：`src/config/whiteList.ts`）
2. **第二步**：使用终端工具（如curl）对接口进行功能测试
3. **第三步**：验证接口响应是否符合预期（状态码、返回数据格式、业务逻辑等）
4. **第四步**：测试完成后，从白名单配置中移除该接口，恢复原始配置

### 2.2 特殊情况处理
- **Token依赖接口**：如果接口逻辑中通过请求头获取token进行身份验证或权限控制，则跳过白名单测试步骤
- **说明要求**：在回答描述时必须明确说明该接口通过请求头获取token，跳过白名单测试的原因

### 2.3 测试记录
测试完成后，应在回答中说明：
- 接口路径和请求方法
- 测试使用的参数
- 测试结果（成功/失败）
- 如跳过白名单测试，需说明原因

## 3. 功能完成验证
完成模块后检查终端是否启动项目，已启动则查看是否有报错，未启动则在 package.json 找启动命令运行。

## 4. 终端命令执行
禁止使用阻塞终端等待用户输入的命令，所有命令必须能自动执行完成。

## 5. 代码开发规范
开发前先检查 `src/common` 和 `src/config` 是否有可复用函数或根实例（DTO、Entity、Service等），优先使用现有资源避免重复开发。

## 6. 功能模块组织
**强制要求**：所有业务功能模块的源代码必须统一放在 `src/modules` 目录下，严禁在其他位置创建功能模块。

### 6.1 模块定义
以下内容必须作为独立模块放在 `src/modules` 目录下：
- 业务功能模块（如：用户管理、订单管理、商品管理等）
- 包含Controller的业务功能
- 包含Service的业务逻辑
- 包含Entity的数据模型
- 包含DTO的数据传输对象

### 6.2 目录结构规范
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

### 6.3 创建新功能时的检查清单
在创建任何新功能前，必须按以下步骤检查：
1. **第一步**：确认是否为业务功能模块（是→继续，否→考虑放入src/common或src/utils）
2. **第二步**：在 `src/modules` 目录下创建对应的模块文件夹
3. **第三步**：按照目录结构规范创建必要的文件（modules、controller、service、entity、dto）
4. **第四步**：将模块注册到 `app.modules.ts` 或对应的父模块中

### 6.4 禁止行为
- ❌ 禁止在 `src` 根目录直接创建业务模块文件
- ❌ 禁止在 `src/common` 中创建业务功能模块
- ❌ 禁止在 `src/config` 中创建业务功能模块
- ❌ 禁止在 `src/utils` 中创建业务功能模块
- ❌ 禁止在项目根目录创建业务模块文件夹

## 7. TypeScript类型安全
- 禁止使用 any 类型，优先使用具体类型、联合类型或泛型
- 第三方库必须使用官方类型定义
- 类型来源优先级：第三方库官方类型 > 项目 DTO/Entity class > src/types 手动定义

## 8. DTO文件组织

### 8.1 目录结构
```
src/modules/{模块名}/dto/
├── request.dto.ts    # 请求DTO
├── response.dto.ts   # 响应DTO
└── index.ts          # 统一导出
```

### 8.2 命名规范
- 请求DTO：动词+名词+Dto（CreateUserDto、UpdateUserDto、QueryUserDto、DeleteUserDto、LoginUserDto）
- 响应DTO：实体名+场景+Response+Dto（UserResponseDto、UserListResponseDto、UserPageResponseDto、UserStatResponseDto）
- 统一要求：PascalCase、以Dto结尾、避免缩写、实体名与数据库一致

### 8.3 响应包装
- 统一响应函数返回值必须使用 `ApiResultWrapperDto<T>` 包装（位于 `src/common/dto/base.ts`）
- 响应格式：code、message、data、timestamp
