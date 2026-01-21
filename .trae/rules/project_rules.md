# 项目规则配置

## 1. 项目优化执行流程规范
在执行项目优化工作时，必须严格按照 `d:\MyDemo\nest-serve\doc\001.项目优化执行步骤_v1.md` 中规定的优化步骤进行操作。每完成一个优化子步骤并通过功能测试和单元测试后，需在 `d:\MyDemo\nest-serve\doc\001.项目优化执行步骤_v1.md` 文档内预留的对应检查项处进行勾选标记，以明确记录该步骤的完成状态。

## 2. 代码开发规范
在开发新功能代码前，开发人员必须首先检查是否存在可复用的现有函数。应优先考虑调用 `d:\MyDemo\nest-serve\src\common` 和 `d:\MyDemo\nest-serve\src\config` 目录中的通用工具函数和配置资源，避免重复开发。

## 3. 功能模块组织规范
所有项目功能模块的源代码必须统一放置在 `d:\MyDemo\nest-serve\src\module` 目录下进行管理，确保项目结构清晰、模块划分明确。

## 4. 功能完成验证规范
在完成一个模块的功能后需要查看终端，是否有终端启动了当前项目，如果启动了查看终端打印是否有报错，如果没有启动则在package.json中找到对应的启动命令再来实现对应的功能。

## 5. 终端命令执行规范
禁止使用会阻塞终端等待用户手动输入的命令（如 `curl -s http://localhost:3000/swagger | Select-String -Pattern "swagger" | Select-Object -First 5`）。所有终端命令必须能够自动执行完成，不需要用户手动输入任何值。

## 6. 端口占用处理规范
当运行项目时发现端口被占用，应优先检查其他终端窗口是否已经在运行当前项目。若已存在运行中的项目实例，应先停止该实例或关闭对应终端，再重新启动项目。

## 7. TypeScript类型安全规范
在TypeScript代码编写时，必须严格遵循类型安全原则：
- **禁止使用any类型**：尽可能避免使用any类型，优先使用具体类型、联合类型或泛型
- **第三方库类型使用**：使用第三方库时必须使用官方提供的类型定义，禁止自行编写类型来替代官方类型
- **类型准确性**：确保类型定义准确反映实际数据结构，避免使用不准确的类型定义"欺骗"类型检查器
- **类型推导**：充分利用TypeScript的类型推导能力，减少显式类型注解的同时保持类型安全
- **类型来源优先级**：涉及 TS 类型时，按以下优先级选择类型来源：
  1. 优先判断是否为第三方库类型，如果是则下载并使用官方提供的类型定义
  2. 如果不是第三方库类型，优先考虑是否可以使用项目中的 DTO（Data Transfer Object）或 Entity（实体）的 class 作为类型
- **类型定义抽离**：当必须手动定义类型时，优先将类型定义抽离到 `src/types` 文件夹对应的文件中，避免在代码中内联定义类型

## 8. DTO文件组织规范
所有模块的DTO（Data Transfer Object）必须按照以下规范进行组织，确保代码结构清晰、易于维护：

### 8.1 DTO文件目录结构
每个业务模块的DTO文件夹应遵循以下结构：
```
src/module/{模块名}/dto/
├── request.dto.ts    # 请求DTO文件（存放所有请求相关的DTO类）
├── response.dto.ts   # 响应DTO文件（存放所有响应相关的DTO类）
└── index.ts          # 通用导出文件（统一导出所有DTO类）
```

### 8.2 DTO类命名规范
所有DTO类必须遵循以下命名规范，确保命名清晰、语义明确：

#### 8.2.1 请求DTO命名规范
请求DTO类命名采用 **动词 + 名词 + Dto** 的格式，动词使用PascalCase，具体规则如下：

- **创建类请求**：使用 `Create` + `实体名` + `Dto`
  - 示例：`CreateUserDto`、`CreateOrderDto`、`CreateProductDto`
  
- **更新类请求**：使用 `Update` + `实体名` + `Dto`
  - 示例：`UpdateUserDto`、`UpdateOrderDto`、`UpdateProductDto`
  
- **查询类请求**：使用 `Query` + `实体名` + `Dto`
  - 示例：`QueryUserDto`、`QueryOrderDto`、`QueryProductDto`
  
- **删除类请求**：使用 `Delete` + `实体名` + `Dto`
  - 示例：`DeleteUserDto`、`DeleteOrderDto`、`DeleteProductDto`
  
- **其他操作请求**：使用对应的动词 + 实体名 + Dto
  - 示例：`LoginUserDto`、`RegisterUserDto`、`ChangePasswordDto`

#### 8.2.2 响应DTO命名规范
响应DTO类命名采用 **名词 + Response + Dto** 的格式，具体规则如下：

- **单个实体响应**：使用 `实体名` + `Response` + `Dto`
  - 示例：`UserResponseDto`、`OrderResponseDto`、`ProductResponseDto`
  
- **列表响应**：使用 `实体名` + `List` + `Response` + `Dto`
  - 示例：`UserListResponseDto`、`OrderListResponseDto`、`ProductListResponseDto`
  
- **分页响应**：使用 `实体名` + `Page` + `Response` + `Dto`
  - 示例：`UserPageResponseDto`、`OrderPageResponseDto`、`ProductPageResponseDto`
  
- **统计/聚合响应**：使用 `实体名` + `Stat` + `Response` + `Dto`
  - 示例：`UserStatResponseDto`、`OrderStatResponseDto`、`ProductStatResponseDto`

#### 8.2.3 命名注意事项
- 所有DTO类名必须以 `Dto` 结尾
- 使用PascalCase命名法（每个单词首字母大写）
- 命名应清晰表达其用途和操作类型
- 避免使用缩写，优先使用完整的英文单词
- 实体名应与数据库实体名称保持一致
- 同一模块内的DTO命名风格应保持统一
