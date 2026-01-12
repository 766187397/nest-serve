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

## 6. 接口测试规范
在测试接口时，需要区分是否需要token认证：
- **不需要token的接口**：将接口路径添加到 `d:\MyDemo\nest-serve\src\config\whiteList.ts` 文件中的JWT白名单，确保接口可以直接访问
- **需要token的接口**：将接口信息记录到 `d:\MyDemo\nest-serve\doc\需要手动测试接口.md` 文件中，包括接口路径、请求方法、参数说明等，后续进行手动测试