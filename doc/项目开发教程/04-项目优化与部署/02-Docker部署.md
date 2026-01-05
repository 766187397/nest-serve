# Docker部署

Docker是一种容器化技术，可以将应用及其依赖打包成一个轻量级、可移植的容器，方便在不同环境中部署和运行。在本章节中，我们将介绍如何使用Docker部署NestJS应用。

## 1. Docker简介

### 1.1 Docker的核心概念

- **镜像（Image）**：是一个只读模板，包含运行应用所需的所有依赖和配置
- **容器（Container）**：是镜像的运行实例，可以被创建、启动、停止、删除等
- **仓库（Repository）**：用于存储和管理Docker镜像
- **Dockerfile**：用于定义如何构建Docker镜像的文本文件
- **Docker Compose**：用于定义和运行多个Docker容器的工具

### 1.2 Docker的优势

- **环境一致性**：确保开发、测试、生产环境一致
- **轻量级**：容器共享宿主机内核，比虚拟机更轻量
- **可移植性**：可以在任何支持Docker的平台上运行
- **隔离性**：容器之间相互隔离，提高安全性
- **易于部署和扩展**：可以快速部署和水平扩展应用

## 2. 安装Docker

### 2.1 Windows系统

1. 下载Docker Desktop for Windows：https://www.docker.com/products/docker-desktop
2. 双击安装包，按照提示完成安装
3. 启动Docker Desktop，确保Docker服务正常运行

### 2.2 macOS系统

1. 下载Docker Desktop for Mac：https://www.docker.com/products/docker-desktop
2. 双击安装包，将Docker图标拖入Applications文件夹
3. 启动Docker Desktop，确保Docker服务正常运行

### 2.3 Linux系统

以Ubuntu为例：

```bash
# 更新包列表
apt-get update

# 安装依赖包
apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common

# 添加Docker GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# 添加Docker仓库
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# 更新包列表
apt-get update

# 安装Docker
apt-get install -y docker-ce docker-ce-cli containerd.io

# 启动Docker服务
systemctl start docker

# 设置Docker开机自启
systemctl enable docker

# 验证Docker安装
docker --version
```

## 3. 创建Dockerfile

Dockerfile是构建Docker镜像的核心文件，包含了构建镜像所需的所有指令。

### 3.1 基础Dockerfile

在项目根目录创建`Dockerfile`文件：

```dockerfile
# 使用Node.js官方镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件到工作目录
COPY . .

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "start:prod"]
```

### 3.2 优化Dockerfile

优化Dockerfile可以减小镜像大小，提高构建速度：

```dockerfile
# 使用Node.js官方镜像作为基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json到工作目录
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制项目文件到工作目录
COPY . .

# 构建项目
RUN npm run build

# 使用更小的基础镜像运行应用
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 从构建阶段复制package.json和构建产物
COPY package*.json ./
COPY --from=builder /app/dist ./dist

# 安装生产依赖
RUN npm ci --only=production

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main"]
```

### 3.3 多阶段构建的优势

1. **减小镜像大小**：只包含运行应用所需的依赖和构建产物
2. **提高构建速度**：利用Docker的缓存机制，只重新构建变化的层
3. **提高安全性**：不包含构建过程中的敏感信息和工具

## 4. 创建.dockerignore文件

.dockerignore文件用于指定在构建镜像时需要忽略的文件和目录，类似于.gitignore。

```
# 依赖目录
node_modules

# 构建产物目录
dist

# 日志文件
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# 编辑器目录和文件
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# 环境变量文件
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 测试覆盖率目录
coverage
.nyc_output
```

## 5. 构建Docker镜像

在项目根目录执行以下命令构建Docker镜像：

```bash
# 构建镜像，-t参数指定镜像名称和标签
docker build -t nestjs-app:latest .

# 查看构建的镜像
docker images
```

## 6. 运行Docker容器

### 6.1 基本运行

```bash
# 运行容器，-p参数映射宿主机端口到容器端口，-d参数后台运行
docker run -d -p 3000:3000 nestjs-app:latest

# 查看运行中的容器
docker ps

# 查看容器日志
docker logs <container-id>

# 进入容器内部
docker exec -it <container-id> /bin/sh

# 停止容器
docker stop <container-id>

# 删除容器
docker rm <container-id>
```

### 6.2 运行时环境变量

可以使用`-e`参数或`--env-file`参数传递环境变量：

```bash
# 使用-e参数传递环境变量
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=database \
  -e DB_PORT=3306 \
  nestjs-app:latest

# 使用--env-file参数加载环境变量文件
docker run -d -p 3000:3000 \
  --env-file .env.production \
  nestjs-app:latest
```

### 6.3 挂载卷

可以使用`-v`参数挂载宿主机目录到容器：

```bash
# 挂载日志目录
docker run -d -p 3000:3000 \
  -v ./logs:/app/logs \
  nestjs-app:latest

# 挂载配置文件
docker run -d -p 3000:3000 \
  -v ./config:/app/config \
  nestjs-app:latest
```

## 7. 使用Docker Compose

Docker Compose可以定义和运行多个Docker容器，适合部署包含多个服务的应用。

### 7.1 安装Docker Compose

Docker Desktop已经包含了Docker Compose，无需单独安装。对于Linux系统，可以参考官方文档安装：https://docs.docker.com/compose/install/

### 7.2 创建docker-compose.yml文件

在项目根目录创建`docker-compose.yml`文件：

```yaml
# 指定Docker Compose版本
version: '3.8'

services:
  # 应用服务
  app:
    # 构建镜像
    build: .
    # 容器名称
    container_name: nestjs-app
    # 重启策略
    restart: unless-stopped
    # 端口映射
    ports:
      - "3000:3000"
    # 环境变量
    environment:
      - NODE_ENV=production
      - DB_HOST=database
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=nestjs_db
    # 依赖关系
    depends_on:
      - database
    # 挂载卷
    volumes:
      - ./logs:/app/logs
    # 网络
    networks:
      - nestjs-network

  # 数据库服务
  database:
    # 使用MySQL官方镜像
    image: mysql:8.0
    # 容器名称
    container_name: nestjs-db
    # 重启策略
    restart: unless-stopped
    # 端口映射
    ports:
      - "3306:3306"
    # 环境变量
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=nestjs_db
    # 挂载卷
    volumes:
      - mysql-data:/var/lib/mysql
    # 网络
    networks:
      - nestjs-network

  # Redis服务
  redis:
    # 使用Redis官方镜像
    image: redis:7.0-alpine
    # 容器名称
    container_name: nestjs-redis
    # 重启策略
    restart: unless-stopped
    # 端口映射
    ports:
      - "6379:6379"
    # 挂载卷
    volumes:
      - redis-data:/data
    # 网络
    networks:
      - nestjs-network

# 卷定义
volumes:
  mysql-data:
  redis-data:

# 网络定义
networks:
  nestjs-network:
    driver: bridge
```

### 7.3 使用Docker Compose命令

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs
# 查看特定服务日志
docker-compose logs app

# 停止所有服务
docker-compose down

# 停止并删除卷
docker-compose down -v

# 重启服务
docker-compose restart

# 构建并启动服务
docker-compose up -d --build
```

## 8. 部署到Docker Hub

Docker Hub是Docker官方的镜像仓库，可以存储和分享Docker镜像。

### 8.1 登录Docker Hub

```bash
docker login
```

### 8.2 标记镜像

```bash
# 标记镜像，格式：docker tag <image-name> <docker-hub-username>/<repository-name>:<tag>
docker tag nestjs-app:latest your-username/nestjs-app:latest
```

### 8.3 推送镜像

```bash
# 推送镜像到Docker Hub
docker push your-username/nestjs-app:latest
```

### 8.4 从Docker Hub拉取镜像

```bash
# 拉取镜像
docker pull your-username/nestjs-app:latest

# 使用拉取的镜像运行容器
docker run -d -p 3000:3000 your-username/nestjs-app:latest
```

## 9. 部署到私有仓库

对于企业环境，可以使用私有Docker仓库，如Harbor、Nexus等。

### 9.1 部署Harbor私有仓库

1. 下载Harbor安装包：https://github.com/goharbor/harbor/releases
2. 解压安装包：`tar xvf harbor-offline-installer-v2.8.0.tgz`
3. 配置Harbor：`cp harbor.yml.tmpl harbor.yml`，修改配置文件
4. 安装Harbor：`sudo ./install.sh`
5. 访问Harbor Web界面：http://your-harbor-ip

### 9.2 使用私有仓库

```bash
# 登录私有仓库
docker login your-harbor-ip

# 标记镜像
docker tag nestjs-app:latest your-harbor-ip/library/nestjs-app:latest

# 推送镜像到私有仓库
docker push your-harbor-ip/library/nestjs-app:latest

# 拉取镜像
docker pull your-harbor-ip/library/nestjs-app:latest
```

## 10. Docker最佳实践

### 10.1 镜像优化

1. **使用官方基础镜像**：官方镜像经过优化，安全性更高
2. **使用更小的基础镜像**：如alpine版本，减小镜像大小
3. **使用多阶段构建**：只包含运行应用所需的依赖和产物
4. **合理使用缓存**：将不常变化的指令放在前面，利用Docker缓存
5. **清理无用文件**：在构建过程中清理临时文件和缓存

### 10.2 容器管理

1. **使用合适的重启策略**：如`unless-stopped`，确保容器故障后自动重启
2. **限制资源使用**：使用`--memory`和`--cpus`参数限制容器资源使用
3. **使用健康检查**：定期检查容器健康状态
4. **日志管理**：使用集中式日志管理系统，如ELK、Loki等
5. **安全加固**：使用非root用户运行容器，限制容器权限

### 10.3 部署策略

1. **滚动更新**：逐步替换旧容器，确保服务不中断
2. **蓝绿部署**：同时运行两个版本，切换流量实现无缝更新
3. **金丝雀部署**：将新版本部署到一小部分用户，验证后再全面推广
4. **使用编排工具**：如Kubernetes，管理大规模容器集群

## 11. 常见问题与解决方案

### 11.1 容器无法启动

- 检查容器日志：`docker logs <container-id>`
- 检查端口是否被占用：`lsof -i :3000`
- 检查环境变量是否正确配置

### 11.2 镜像构建失败

- 检查Dockerfile语法是否正确
- 检查依赖是否可以正常安装
- 检查网络连接是否正常

### 11.3 容器之间无法通信

- 确保容器在同一个网络中
- 检查容器名称或IP是否正确
- 检查防火墙规则是否允许容器通信

### 11.4 镜像大小过大

- 使用多阶段构建
- 清理构建过程中的临时文件
- 使用更小的基础镜像

## 12. 总结

Docker部署是现代应用部署的重要方式，具有环境一致性、轻量级、可移植性等优势。本章节我们介绍了：

1. Docker的核心概念和优势
2. Docker的安装方法
3. Dockerfile的编写和优化
4. .dockerignore文件的创建
5. Docker镜像的构建和运行
6. Docker Compose的使用
7. 镜像的推送和拉取
8. 私有仓库的使用
9. Docker最佳实践
10. 常见问题与解决方案

通过本章节的学习，我们掌握了使用Docker部署NestJS应用的完整流程，可以根据实际需求选择合适的部署策略。