# CI/CD流水线

CI/CD（持续集成/持续部署）是一种软件开发实践，通过自动化构建、测试和部署流程，提高开发效率和代码质量。本章节将详细介绍NestJS应用的CI/CD流水线实现，包括GitHub Actions、GitLab CI等工具的使用。

## 1. CI/CD概述

### 1.1 什么是CI/CD

- **持续集成（CI）**：频繁地将代码集成到主分支，每次集成都会触发自动化构建和测试，确保代码质量
- **持续交付（CD）**：在CI的基础上，将通过测试的代码自动部署到预生产环境，准备发布
- **持续部署（CD）**：在持续交付的基础上，将代码自动部署到生产环境

### 1.2 CI/CD的好处

- **提高开发效率**：自动化流程减少手动操作，加快开发速度
- **提高代码质量**：自动化测试确保代码符合质量标准
- **减少部署风险**：频繁部署降低每次部署的风险
- **快速反馈**：及时发现和修复问题
- **提高团队协作效率**：团队成员可以快速集成和测试代码

### 1.3 CI/CD流水线阶段

1. **代码提交**：开发者将代码提交到版本控制系统
2. **代码检查**：自动化代码质量检查，如lint、type check
3. **构建**：编译代码，生成可执行文件
4. **测试**：运行单元测试、集成测试、E2E测试
5. **部署**：将通过测试的代码部署到目标环境
6. **监控**：监控应用运行状态，收集日志和指标

## 2. GitHub Actions

GitHub Actions是GitHub提供的CI/CD服务，可以直接集成到GitHub仓库中。

### 2.1 基本概念

- **Workflow**：工作流，定义完整的CI/CD流程
- **Job**：任务，工作流中的一个环节，如构建、测试、部署
- **Step**：步骤，任务中的具体操作，如安装依赖、运行命令
- **Action**：动作，可复用的步骤集合，如checkout代码、设置Node.js环境

### 2.2 创建GitHub Actions工作流

在项目根目录创建`.github/workflows`目录，然后创建工作流文件，如`ci-cd.yml`：

```yaml
# .github/workflows/ci-cd.yml
# GitHub Actions工作流配置，用于NestJS应用的CI/CD流水线
name: NestJS CI/CD Pipeline

# 触发条件：推送到main分支或创建pull request到main分支
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  # 手动触发
  workflow_dispatch:

# 环境变量
env:
  NODE_VERSION: '18.x'
  DB_TYPE: 'sqlite'
  DB_DATABASE: ':memory:'

# 作业定义
jobs:
  # 代码检查作业
  lint-and-typecheck:
    # 运行环境
    runs-on: ubuntu-latest
    steps:
      # 检出代码
      - uses: actions/checkout@v3
      
      # 设置Node.js环境
      - name: Use Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          # 缓存node_modules
          cache: 'npm'
      
      # 安装依赖
      - name: Install dependencies
        run: npm ci
      
      # 运行lint检查
      - name: Run lint
        run: npm run lint
      
      # 运行类型检查
      - name: Run type check
        run: npm run typecheck

  # 测试作业
  test:
    # 依赖关系：在lint-and-typecheck完成后运行
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      # 运行单元测试
      - name: Run unit tests
        run: npm run test
      
      # 运行集成测试
      - name: Run integration tests
        run: npm run test:integration
      
      # 运行E2E测试
      - name: Run E2E tests
        run: npm run test:e2e
      
      # 上传覆盖率报告
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  # 构建作业
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      # 构建应用
      - name: Build application
        run: npm run build
      
      # 保存构建产物
      - name: Archive build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: nestjs-app-build
          path: dist/
          retention-days: 7

  # 部署作业
  deploy:
    # 只有推送到main分支时才运行部署
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # 下载构建产物
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: nestjs-app-build
          path: dist/
      
      # 部署到服务器
      - name: Deploy to server via SSH
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          port: ${{ secrets.SERVER_PORT || '22' }}
          script: |
            # 进入应用目录
            cd /path/to/your/nestjs-app
            
            # 拉取最新代码
            git pull origin main
            
            # 安装依赖
            npm ci --only=production
            
            # 重启应用（使用PM2）
            pm2 restart nestjs-app || pm2 start dist/main.js --name nestjs-app
            
            # 清理旧构建产物
            rm -rf old_dist && mv dist old_dist || true
```

### 2.3 配置GitHub Secrets

在GitHub仓库中配置 secrets，用于存储敏感信息：

1. 进入仓库 -> Settings -> Secrets and variables -> Actions
2. 添加以下 secrets：
   - `SERVER_HOST`：服务器IP地址
   - `SERVER_USERNAME`：服务器用户名
   - `SERVER_SSH_KEY`：服务器SSH私钥
   - `SERVER_PORT`：服务器SSH端口（可选，默认22）
   - `CODECOV_TOKEN`：Codecov令牌（用于上传覆盖率报告）

### 2.4 运行工作流

- 推送代码到main分支或创建pull request到main分支时，工作流会自动触发
- 也可以在GitHub仓库的Actions页面手动触发工作流

## 3. GitLab CI

GitLab CI是GitLab提供的CI/CD服务，与GitLab仓库深度集成。

### 3.1 基本概念

- **Pipeline**：流水线，定义完整的CI/CD流程
- **Stage**：阶段，流水线中的一个环节，如build、test、deploy
- **Job**：任务，阶段中的具体操作，如安装依赖、运行测试
- **Runner**：运行器，执行CI/CD任务的环境

### 3.2 创建GitLab CI配置文件

在项目根目录创建`.gitlab-ci.yml`文件：

```yaml
# .gitlab-ci.yml
# GitLab CI配置文件，用于NestJS应用的CI/CD流水线
image: node:18-alpine

# 环境变量
environment:
  variables:
    NODE_ENV: 'production'

# 阶段定义
stages:
  - lint
  - test
  - build
  - deploy

# 缓存配置
cache:
  paths:
    - node_modules/

# 代码检查作业
lint:
  stage: lint
  script:
    - npm ci
    - npm run lint
    - npm run typecheck
  only:
    - main
    - merge_requests

# 测试作业
test:
  stage: test
  services:
    - mysql:8.0
  variables:
    # MySQL服务配置
    MYSQL_ROOT_PASSWORD: root_password
    MYSQL_DATABASE: test_db
    MYSQL_USER: test_user
    MYSQL_PASSWORD: test_password
    # 应用数据库配置
    DB_HOST: mysql
    DB_PORT: 3306
    DB_USERNAME: test_user
    DB_PASSWORD: test_password
    DB_DATABASE: test_db
  script:
    - npm ci
    - npm run test:cov
  only:
    - main
    - merge_requests
  artifacts:
    reports:
      # 覆盖率报告
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# 构建作业
build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  only:
    - main
    - tags

# 部署到预生产环境
deploy-staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.example.com
  script:
    - echo "Deploying to staging environment..."
    - npm ci --only=production
    - pm2 restart nestjs-app-staging || pm2 start dist/main.js --name nestjs-app-staging
  only:
    - main
  when: manual

# 部署到生产环境
deploy-production:
  stage: deploy
  environment:
    name: production
    url: https://example.com
  script:
    - echo "Deploying to production environment..."
    - npm ci --only=production
    - pm2 restart nestjs-app-production || pm2 start dist/main.js --name nestjs-app-production
  only:
    - tags
  when: manual
```

### 3.3 配置GitLab Runner

1. **安装GitLab Runner**：
   - 参考文档：https://docs.gitlab.com/runner/install/

2. **注册GitLab Runner**：
   ```bash
   gitlab-runner register
   ```
   - 输入GitLab实例URL
   - 输入Runner注册令牌（在GitLab项目 -> Settings -> CI/CD -> Runners -> Specific runners中获取）
   - 输入Runner描述
   - 输入Runner标签
   - 选择Runner执行者（如shell、docker）

3. **启动GitLab Runner**：
   ```bash
   # Linux
   sudo gitlab-runner start
   
   # Windows
   gitlab-runner.exe start
   ```

### 3.4 运行流水线

- 推送代码到main分支或创建merge request时，流水线会自动触发
- 也可以在GitLab项目的CI/CD -> Pipelines页面手动触发流水线

## 4. Docker集成

在CI/CD流水线中集成Docker，可以将应用打包成Docker镜像，然后部署到容器环境中。

### 4.1 GitHub Actions + Docker

更新GitHub Actions工作流，添加Docker构建和推送步骤：

```yaml
# .github/workflows/ci-cd.yml

# 添加Docker构建和推送作业
build-and-push-docker:
  needs: test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    
    # 设置Docker Buildx
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    # 登录到Docker Hub
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_HUB_USERNAME }}
        password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
    
    # 提取元数据（标签、版本等）
    - name: Extract Docker metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ secrets.DOCKER_HUB_USERNAME }}/nestjs-app
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
    
    # 构建并推送Docker镜像
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: ${{ github.event_name != 'pull_request' }}
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        # 使用缓存提高构建速度
        cache-from: type=gha
        cache-to: type=gha,mode=max

# 更新部署作业，使用Docker部署
deploy:
  needs: build-and-push-docker
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    
    # 部署到服务器
    - name: Deploy to server via SSH
      uses: appleboy/ssh-action@v0.1.10
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USERNAME }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          # 拉取最新Docker镜像
          docker pull ${{ secrets.DOCKER_HUB_USERNAME }}/nestjs-app:main
          
          # 停止并移除旧容器
          docker stop nestjs-app || true
          docker rm nestjs-app || true
          
          # 运行新容器
          docker run -d -p 3000:3000 --name nestjs-app \
            --env-file .env.production \
            ${{ secrets.DOCKER_HUB_USERNAME }}/nestjs-app:main
          
          # 清理无用镜像
          docker system prune -f
```

### 4.2 GitLab CI + Docker

更新GitLab CI配置文件，添加Docker构建和推送步骤：

```yaml
# .gitlab-ci.yml

# 使用Docker镜像作为构建环境
build-docker:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE:latest .
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main
    - tags

# 使用Docker部署
deploy-docker:
  stage: deploy
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker pull $CI_REGISTRY_IMAGE:latest
    - docker stop nestjs-app || true
    - docker rm nestjs-app || true
    - docker run -d -p 3000:3000 --name nestjs-app --env-file .env.production $CI_REGISTRY_IMAGE:latest
  only:
    - tags
  when: manual
```

## 5. 代码质量检查

### 5.1 ESLint

ESLint是一个静态代码分析工具，用于检查代码质量和风格。

配置ESLint：

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
```

在package.json中添加lint脚本：

```json
{
  "scripts": {
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

### 5.2 Prettier

Prettier是一个代码格式化工具，用于保持代码风格一致。

配置Prettier：

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 120
}
```

在package.json中添加prettier脚本：

```json
{
  "scripts": {
    "prettier": "prettier --write \"{src,apps,libs,test}/**/*.ts\""
  }
}
```

### 5.3 Husky和Lint-Staged

Husky和Lint-Staged用于在提交代码前自动运行lint和prettier，确保提交的代码符合质量标准。

安装依赖：

```bash
npm install --save-dev husky lint-staged
```

配置Husky：

```bash
# 初始化Husky
husky install

# 添加pre-commit钩子
husky add .husky/pre-commit "npx lint-staged"
```

配置Lint-Staged：

```json
// package.json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 6. 测试策略

### 6.1 测试分层

- **单元测试**：测试单个组件或函数，运行速度快，隔离性好
- **集成测试**：测试多个组件协同工作，验证组件间交互
- **E2E测试**：测试完整的应用流程，模拟真实用户场景

### 6.2 测试覆盖率

- 目标覆盖率：至少80%
- 重点测试核心业务逻辑
- 使用工具如Jest、Istanbul生成覆盖率报告

### 6.3 测试脚本配置

在package.json中配置测试脚本：

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:integration": "jest --config jest.integration.json",
    "test:e2e": "jest --config jest.e2e.json"
  }
}
```

## 7. 部署策略

### 7.1 环境管理

- **开发环境**：开发者本地环境，用于开发和调试
- **测试环境**：用于集成测试和QA测试
- **预生产环境**：与生产环境配置相同，用于最终测试
- **生产环境**：用户访问的正式环境

### 7.2 部署方式

- **蓝绿部署**：同时运行两个版本，通过切换路由实现无缝部署
- **滚动部署**：逐步替换旧版本，减少停机时间
- **金丝雀部署**：先部署到小部分服务器，验证后再全部部署
- **A/B测试**：同时运行两个版本，测试不同版本的效果

### 7.3 配置管理

- 使用环境变量管理配置
- 不同环境使用不同的配置文件
- 敏感信息使用密钥管理服务，如AWS Secrets Manager、HashiCorp Vault

## 8. 监控和告警

### 8.1 部署后监控

- **应用监控**：监控应用的运行状态、性能指标和错误率
- **日志监控**：收集和分析应用日志
- **基础设施监控**：监控服务器、数据库等基础设施的状态

### 8.2 告警机制

- **设置告警规则**：根据监控指标设置告警阈值
- **配置告警渠道**：邮件、Slack、短信等
- **告警升级策略**：根据告警级别和持续时间，升级告警方式

## 9. CI/CD最佳实践

### 9.1 保持流水线简洁

- 每个作业只做一件事
- 避免在流水线中添加复杂逻辑
- 使用缓存提高构建速度

### 9.2 自动化所有步骤

- 自动化代码检查、构建、测试、部署
- 自动化监控和告警
- 自动化回滚机制

### 9.3 保持环境一致性

- 开发、测试、生产环境配置一致
- 使用Docker确保环境一致性
- 使用基础设施即代码（IaC）管理环境配置

### 9.4 频繁部署

- 每天至少部署一次
- 每次部署的代码量不宜过大
- 确保部署过程可回滚

### 9.5 安全第一

- 扫描依赖包中的安全漏洞
- 扫描代码中的安全问题
- 保护敏感信息，使用密钥管理服务

## 10. 总结

本章节介绍了NestJS应用的CI/CD流水线实现，包括：

- CI/CD的基本概念和好处
- GitHub Actions的使用，包括工作流配置、secrets管理、Docker集成
- GitLab CI的使用，包括pipeline配置、runner设置
- 代码质量检查工具的集成，如ESLint、Prettier、Husky
- 测试策略和测试脚本配置
- 部署策略和环境管理
- 监控和告警机制
- CI/CD最佳实践

通过实现CI/CD流水线，可以提高开发效率，确保代码质量，减少部署风险，快速反馈问题，提高团队协作效率。在实际项目中，应该根据项目规模和需求选择合适的CI/CD工具和策略，并不断优化和调整流水线。

## 11. 扩展阅读

- [GitHub Actions官方文档](https://docs.github.com/en/actions)
- [GitLab CI官方文档](https://docs.gitlab.com/ee/ci/)
- [Docker官方文档](https://docs.docker.com/)
- [ESLint官方文档](https://eslint.org/docs/)
- [Prettier官方文档](https://prettier.io/docs/en/)
- [Jest官方文档](https://jestjs.io/docs/getting-started)
- [持续交付：发布可靠软件的系统方法](https://continuousdelivery.com/)
- [DevOps Handbook](https://itrevolution.com/product/the-devops-handbook/)
