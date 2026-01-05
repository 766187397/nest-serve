# Zeabur部署

Zeabur是一个现代化的云原生部署平台，提供简单易用的部署方式，支持多种编程语言和框架。在本章节中，我们将介绍如何使用Zeabur部署NestJS应用。

## 1. Zeabur简介

### 1.1 Zeabur的核心特点

- **零配置部署**：无需编写复杂的配置文件，自动识别项目类型
- **多语言支持**：支持Node.js、Python、Go、Java等多种语言
- **自动构建**：代码提交后自动构建和部署
- **弹性伸缩**：根据流量自动调整资源
- **免费使用**：提供免费额度，适合个人项目和小型团队
- **集成生态**：支持数据库、缓存、CDN等多种服务集成

### 1.2 Zeabur的优势

- **简单易用**：只需要连接代码仓库，即可完成部署
- **快速部署**：从代码提交到部署完成，通常只需要几分钟
- **无需运维**：平台负责服务器管理、监控、备份等运维工作
- **成本低廉**：按使用付费，没有最低消费
- **全球化部署**：支持在全球多个地区部署应用

## 2. 准备工作

### 2.1 注册Zeabur账号

1. 访问Zeabur官网：https://zeabur.com/
2. 点击"Sign Up"按钮，使用GitHub或邮箱注册账号
3. 完成注册后，登录Zeabur控制台

### 2.2 准备代码仓库

确保你的NestJS项目已经托管在GitHub、GitLab或Gitee等代码仓库中。Zeabur支持以下代码仓库：

- GitHub
- GitLab
- Gitee
- Bitbucket

### 2.3 配置项目

确保你的项目包含以下文件：

1. **package.json**：包含项目依赖和脚本
2. **tsconfig.json**：TypeScript配置文件
3. **nest-cli.json**：NestJS CLI配置文件

## 3. 部署流程

### 3.1 创建项目

1. 登录Zeabur控制台
2. 点击"Create Project"按钮，创建一个新项目
3. 输入项目名称，点击"Create"

### 3.2 添加服务

1. 在项目页面，点击"Add Service"按钮
2. 选择"Git Repository"，连接你的代码仓库
3. 选择你要部署的仓库和分支
4. 点击"Import"按钮，开始部署

### 3.3 等待部署完成

Zeabur会自动：
1. 克隆代码仓库
2. 安装依赖
3. 构建项目
4. 部署应用

部署过程通常需要几分钟，你可以在控制台查看部署日志。

### 3.4 访问应用

部署完成后，Zeabur会为你的应用分配一个默认域名，格式为：`https://<service-name>-<project-name>.zeabur.app`。

你也可以绑定自定义域名：
1. 在服务页面，点击"Settings"标签
2. 选择"Domains"选项
3. 点击"Add Domain"按钮
4. 输入你的自定义域名，点击"Add"
5. 根据提示，在域名注册商处添加DNS记录

## 4. 配置环境变量

### 4.1 添加环境变量

1. 在服务页面，点击"Settings"标签
2. 选择"Environment Variables"选项
3. 点击"Add Variable"按钮
4. 输入环境变量名称和值，点击"Add"

### 4.2 环境变量示例

对于NestJS应用，通常需要配置以下环境变量：

```
NODE_ENV=production
PORT=3000
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret
```

## 5. 集成数据库

Zeabur支持多种数据库服务，包括MySQL、PostgreSQL、MongoDB等。

### 5.1 添加数据库服务

1. 在项目页面，点击"Add Service"按钮
2. 选择"Database"选项
3. 选择你需要的数据库类型（如MySQL）
4. 输入数据库名称，点击"Create"

### 5.2 连接数据库

数据库创建完成后，Zeabur会自动生成连接信息，包括：
- 主机名
- 端口
- 用户名
- 密码
- 数据库名

你可以在数据库服务页面查看这些信息，并将它们配置到你的应用环境变量中。

## 6. 配置自动部署

Zeabur默认开启自动部署，当你向代码仓库提交代码时，会自动触发构建和部署。

### 6.1 配置部署分支

1. 在服务页面，点击"Settings"标签
2. 选择"Git"选项
3. 在"Deploy Branch"下拉菜单中，选择你要部署的分支
4. 点击"Save"按钮

### 6.2 配置部署脚本

如果需要自定义构建和部署脚本，可以在`package.json`中配置：

```json
{
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:prod": "node dist/main"
  }
}
```

Zeabur会按照以下顺序执行脚本：
1. 安装依赖：`npm install`或`yarn install`
2. 构建项目：`npm run build`或`yarn build`
3. 启动应用：`npm start`或`yarn start`

## 7. 监控和日志

### 7.1 查看日志

1. 在服务页面，点击"Logs"标签
2. 查看实时日志和历史日志
3. 使用搜索功能查找特定日志
4. 调整日志级别

### 7.2 监控资源使用

1. 在服务页面，点击"Metrics"标签
2. 查看CPU、内存、网络等资源使用情况
3. 查看请求次数和响应时间
4. 设置告警规则

## 8. 配置HTTPS

Zeabur默认提供免费的HTTPS证书，无需额外配置。

### 8.1 绑定自定义域名

1. 在服务页面，点击"Settings"标签
2. 选择"Domains"选项
3. 点击"Add Domain"按钮
4. 输入你的自定义域名，点击"Add"
5. 根据提示，在域名注册商处添加CNAME记录
6. 等待DNS解析生效后，HTTPS证书会自动签发

## 9. 配置CI/CD

### 9.1 配置GitHub Actions

如果需要更复杂的CI/CD流程，可以使用GitHub Actions：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Zeabur

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Zeabur
      uses: zeabur/action@v1
      with:
        service_id: ${{ secrets.ZEABUR_SERVICE_ID }}
        token: ${{ secrets.ZEABUR_TOKEN }}
```

### 9.2 获取Zeabur Token

1. 访问Zeabur API页面：https://zeabur.com/account/api
2. 点击"Create Token"按钮
3. 输入Token名称，点击"Create"
4. 复制生成的Token，保存到GitHub Secrets中

## 10. 常见问题与解决方案

### 10.1 部署失败

- 检查部署日志，查看具体错误信息
- 确保依赖可以正常安装
- 确保构建脚本可以正常执行
- 检查环境变量是否正确配置

### 10.2 应用无法访问

- 检查应用是否正在运行
- 检查端口是否正确配置
- 检查防火墙规则是否允许外部访问
- 检查域名解析是否生效

### 10.3 数据库连接失败

- 检查数据库连接信息是否正确
- 确保数据库服务正在运行
- 检查数据库用户权限是否正确
- 确保数据库允许外部连接

### 10.4 资源使用过高

- 优化应用代码，减少资源消耗
- 考虑升级服务规格
- 配置自动伸缩规则

## 11. Zeabur最佳实践

### 11.1 项目结构

- 保持项目结构清晰，便于Zeabur自动识别
- 确保package.json包含正确的依赖和脚本
- 使用TypeScript，提高代码质量和可维护性

### 11.2 环境管理

- 使用环境变量管理不同环境的配置
- 不要在代码中硬编码敏感信息
- 使用Secrets管理敏感信息，如数据库密码、API密钥等

### 11.3 部署策略

- 使用主分支部署生产环境，开发分支部署测试环境
- 配置CI/CD流程，自动运行测试和构建
- 使用版本控制，便于回滚到之前的版本

### 11.4 监控和告警

- 设置合理的告警规则，及时发现问题
- 定期查看日志和监控数据
- 配置错误跟踪，如Sentry，便于定位问题

## 12. 总结

Zeabur是一个简单易用的云原生部署平台，适合个人项目和小型团队使用。本章节我们介绍了：

1. Zeabur的核心特点和优势
2. 部署前的准备工作
3. 完整的部署流程
4. 环境变量的配置
5. 数据库的集成
6. 自动部署的配置
7. 监控和日志的查看
8. HTTPS的配置
9. CI/CD的配置
10. 常见问题与解决方案
11. Zeabur最佳实践

通过Zeabur，你可以快速部署和管理你的NestJS应用，无需关心服务器运维，专注于业务逻辑开发。