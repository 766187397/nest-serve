# 项目规则配置

## 1. 项目优化执行流程
严格按 `doc/001.项目优化执行步骤_v1.md` 执行优化，每完成一步并测试通过后，在文档对应检查项处勾选标记。

## 2. 代码开发规范
开发前先检查 `src/common` 和 `src/config` 是否有可复用函数，优先使用现有资源避免重复开发。

## 3. 功能模块组织
所有功能模块源代码统一放在 `src/module` 目录下。

## 4. 功能完成验证
完成模块后检查终端是否启动项目，已启动则查看是否有报错，未启动则在 package.json 找启动命令运行。

## 5. 终端命令执行
禁止使用阻塞终端等待用户输入的命令，所有命令必须能自动执行完成。

## 6. 端口占用处理
端口被占用时先检查其他终端是否已运行项目，先停止再重新启动。

## 7. TypeScript类型安全
- 禁止使用 any 类型，优先使用具体类型、联合类型或泛型
- 第三方库必须使用官方类型定义
- 类型来源优先级：第三方库官方类型 > 项目 DTO/Entity class > src/types 手动定义

## 8. DTO文件组织

### 8.1 目录结构
```
src/module/{模块名}/dto/
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
