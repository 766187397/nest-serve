# Docker容器化

## 1. Docker概述

Docker是一个开源的容器化平台，允许开发者将应用程序及其依赖打包成一个轻量级、可移植的容器，然后在任何Linux、Windows或macOS系统上运行。Docker容器化技术彻底改变了应用程序的部署和管理方式，提供了更高的灵活性、可移植性和效率。

### 1.1 Docker的优势

- **轻量级**：Docker容器共享宿主操作系统内核，不需要额外的虚拟机管理程序，占用资源少
- **可移植性**：容器可以在任何支持Docker的平台上运行，实现"一次构建，到处运行"
- **一致性**：容器包含应用程序及其所有依赖，确保在不同环境中运行结果一致
- **快速部署**：容器启动时间通常在秒级，比虚拟机快得多
- **隔离性**：容器之间相互隔离，提供了安全的运行环境
- **可扩展性**：可以轻松地扩展或缩减容器数量，适应不同的负载需求
- **版本控制**：可以对容器镜像进行版本控制，方便回滚和管理
- **持续集成/持续部署**：与CI/CD工具集成，实现自动化构建和部署

### 1.2 Docker与虚拟机的区别

| 特性 | Docker容器 | 虚拟机 |
| --- | --- | --- |
| **启动时间** | 秒级 | 分钟级 |
| **资源占用** | 低，共享宿主内核 | 高，需要完整的操作系统 |
| **隔离性** | 进程级隔离 | 完全隔离 |
| **性能** | 接近原生性能 | 有一定性能损失 |
| **镜像大小** | 通常MB级 | 通常GB级 |
| **可移植性** | 高，跨平台兼容 | 受限于虚拟机管理程序 |
| **资源利用率** | 高，可运行数千个容器 | 低，只能运行几十个虚拟机 |

### 1.3 Docker的应用场景

- **应用程序打包和部署**：将应用程序及其依赖打包成容器，简化部署流程
- **微服务架构**：在微服务架构中，每个服务可以独立打包成容器，方便管理和扩展
- **持续集成/持续部署**：与CI/CD工具集成，实现自动化构建、测试和部署
- **开发环境一致性**：确保开发、测试和生产环境一致，减少"在我的机器上可以运行"的问题
- **负载均衡和扩展**：根据负载动态扩展容器数量
- **隔离测试环境**：为每个测试团队提供隔离的测试环境

## 2. Docker核心组件

### 2.1 Docker镜像（Image）

Docker镜像是一个只读的模板，包含了运行应用程序所需的所有文件系统、代码、运行时、库和环境变量。镜像是创建Docker容器的基础。

**特点**：
- 分层存储：镜像采用分层结构，每一层都是只读的
- 可复用：不同的镜像可以共享相同的层，减少存储空间
- 版本控制：可以对镜像进行版本标记和管理

### 2.2 Docker容器（Container）

Docker容器是从镜像创建的运行实例，包含了运行应用程序所需的完整运行环境。容器可以被启动、停止、删除和暂停。

**特点**：
- 可写层：容器在镜像的基础上添加了一个可写层，所有的修改都保存在这个层中
- 隔离性：每个容器都有自己的网络、进程和文件系统
- 轻量级：容器启动快速，占用资源少

### 2.3 Docker仓库（Registry）

Docker仓库是用于存储和分发Docker镜像的服务。Docker Hub是官方的公共仓库，包含了大量的官方和社区镜像。

**类型**：
- **公共仓库**：如Docker Hub、Google Container Registry、AWS ECR
- **私有仓库**：企业内部使用的私有镜像仓库，如Docker Trusted Registry、Harbor

### 2.4 Docker引擎（Docker Engine）

Docker引擎是Docker的核心组件，负责管理镜像、容器、网络和存储。它包含以下部分：
- **Docker守护进程（dockerd）**：后台运行的服务，负责管理Docker对象
- **Docker客户端（docker）**：命令行工具，用于与Docker守护进程通信
- **REST API**：用于与Docker守护进程通信的接口

## 3. Docker安装和配置

### 3.1 在Ubuntu上安装Docker

```bash
# 更新软件包列表
sudo apt-get update

# 安装依赖包
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加Docker仓库
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新软件包列表
sudo apt-get update

# 安装Docker引擎
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# 验证Docker安装是否成功
sudo docker run hello-world
```

### 3.2 在CentOS/RHEL上安装Docker

```bash
# 安装依赖包
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# 添加Docker仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装Docker引擎
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 启动Docker服务
sudo systemctl start docker

# 启用Docker开机自启
sudo systemctl enable docker

# 验证Docker安装是否成功
sudo docker run hello-world
```

### 3.3 在macOS上安装Docker

1. 从Docker官网下载Docker Desktop for Mac
2. 双击下载的.dmg文件，将Docker应用拖到Applications文件夹
3. 启动Docker应用，按照提示完成安装
4. 验证Docker安装是否成功：
   ```bash
   docker run hello-world
   ```

### 3.4 在Windows上安装Docker

1. 从Docker官网下载Docker Desktop for Windows
2. 运行安装程序，按照提示完成安装
3. 启动Docker应用，按照提示完成配置
4. 验证Docker安装是否成功：
   ```bash
   docker run hello-world
   ```

### 3.5 配置Docker用户组

默认情况下，Docker命令需要使用sudo权限。可以将当前用户添加到docker用户组，避免每次使用sudo：

```bash
# 创建docker用户组（如果不存在）
sudo groupadd docker

# 将当前用户添加到docker用户组
sudo usermod -aG docker $USER

# 刷新用户组设置
newgrp docker

# 验证是否可以不使用sudo运行Docker命令
docker run hello-world
```

## 4. Docker镜像管理

### 4.1 获取镜像

使用`docker pull`命令从仓库拉取镜像：

```bash
# 拉取最新版的Ubuntu镜像
docker pull ubuntu

# 拉取指定版本的Ubuntu镜像
docker pull ubuntu:22.04

# 拉取私有仓库的镜像
docker pull my-registry.example.com/my-image:latest
```

### 4.2 查看镜像

使用`docker images`命令查看本地镜像：

```bash
# 查看所有本地镜像
docker images

# 查看特定镜像
docker images ubuntu

# 查看镜像的详细信息
docker inspect ubuntu:latest
```

### 4.3 删除镜像

使用`docker rmi`命令删除镜像：

```bash
# 删除指定镜像
docker rmi ubuntu:22.04

# 删除所有未使用的镜像
docker image prune

# 删除所有镜像
docker image prune -a
```

### 4.4 构建镜像

使用Dockerfile构建自定义镜像。Dockerfile是一个包含构建镜像指令的文本文件。

#### 4.4.1 创建Dockerfile

```dockerfile
# 指定基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码到工作目录
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 设置启动命令
CMD ["npm", "run", "start:prod"]
```

#### 4.4.2 构建镜像

使用`docker build`命令构建镜像：

```bash
# 构建镜像，标签为my-app:latest
docker build -t my-app:latest .

# 构建镜像，使用特定的Dockerfile
docker build -f Dockerfile.prod -t my-app:prod .

# 构建镜像，推送到私有仓库
docker build -t my-registry.example.com/my-app:latest .
```

### 4.5 推送镜像

使用`docker push`命令将镜像推送到仓库：

```bash
# 登录到Docker仓库
docker login my-registry.example.com

# 推送镜像到仓库
docker push my-registry.example.com/my-app:latest

# 推送所有标签的镜像
docker push --all-tags my-registry.example.com/my-app
```

## 5. Docker容器管理

### 5.1 运行容器

使用`docker run`命令运行容器：

```bash
# 运行一个交互式的Ubuntu容器
docker run -it ubuntu:22.04 /bin/bash

# 运行一个后台运行的Nginx容器
docker run -d --name my-nginx -p 80:80 nginx

# 运行容器并挂载本地目录
docker run -d --name my-app -p 3000:3000 -v $(pwd):/app my-app:latest

# 运行容器并设置环境变量
docker run -d --name my-app -p 3000:3000 -e NODE_ENV=production -e PORT=3000 my-app:latest

# 运行容器并限制资源
docker run -d --name my-app -p 3000:3000 --cpus=1 --memory=512m my-app:latest
```

### 5.2 查看容器

使用`docker ps`命令查看容器：

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看容器的详细信息
docker inspect my-app

# 查看容器的日志
docker logs my-app

# 实时查看容器的日志
docker logs -f my-app

# 查看容器的进程
docker top my-app
```

### 5.3 管理容器

```bash
# 启动容器
docker start my-app

# 停止容器
docker stop my-app

# 重启容器
docker restart my-app

# 暂停容器
docker pause my-app

# 恢复容器
docker unpause my-app

# 删除容器
docker rm my-app

# 删除所有停止的容器
docker container prune

# 进入运行中的容器
docker exec -it my-app /bin/bash

# 复制文件到容器
docker cp file.txt my-app:/app/file.txt

# 从容器复制文件
docker cp my-app:/app/file.txt ./file.txt
```

## 6. Docker网络

### 6.1 Docker网络类型

- **bridge**：默认网络模式，容器连接到Docker内置的桥接网络
- **host**：容器使用宿主主机的网络，没有网络隔离
- **none**：容器没有网络连接
- **overlay**：用于连接多个Docker守护进程，实现跨主机通信
- **macvlan**：为容器分配MAC地址，使其看起来像物理设备
- **自定义网络**：用户创建的网络，可以指定网络驱动和参数

### 6.2 管理Docker网络

```bash
# 查看网络
docker network ls

# 查看网络详细信息
docker network inspect bridge

# 创建自定义网络
docker network create --driver bridge my-network

# 运行容器并连接到自定义网络
docker run -d --name my-app --network my-network my-app:latest

# 将容器连接到网络
docker network connect my-network my-app

# 将容器从网络断开
docker network disconnect my-network my-app

# 删除网络
docker network rm my-network

# 删除所有未使用的网络
docker network prune
```

## 7. Docker存储

### 7.1 Docker存储驱动

Docker支持多种存储驱动，用于管理容器的可写层：
- **overlay2**：默认存储驱动，适合大多数Linux发行版
- **aufs**：较旧的存储驱动，适合Ubuntu 14.04
- **devicemapper**：适合CentOS/RHEL
- **btrfs**：适合使用Btrfs文件系统的系统
- **zfs**：适合使用ZFS文件系统的系统

### 7.2 数据卷

数据卷是用于持久化存储容器数据的机制，可以在容器之间共享和重用。

```bash
# 创建数据卷
docker volume create my-volume

# 查看数据卷
docker volume ls

# 查看数据卷详细信息
docker volume inspect my-volume

# 运行容器并挂载数据卷
docker run -d --name my-db -v my-volume:/var/lib/mysql mysql:8.0

# 删除数据卷
docker volume rm my-volume

# 删除所有未使用的数据卷
docker volume prune
```

### 7.3 绑定挂载

绑定挂载是将宿主主机的目录或文件挂载到容器中：

```bash
# 挂载宿主目录到容器
docker run -d --name my-app -v $(pwd):/app my-app:latest

# 挂载宿主文件到容器
docker run -d --name my-app -v $(pwd)/.env:/app/.env my-app:latest
```

## 8. Docker Compose

Docker Compose是用于定义和运行多容器Docker应用程序的工具。使用YAML文件定义服务、网络和卷，然后使用一个命令启动所有服务。

### 8.1 安装Docker Compose

```bash
# 安装Docker Compose（Linux）
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### 8.2 创建docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=myapp
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules
    restart: always

  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=myapp
    volumes:
      - mysql-data:/var/lib/mysql
    restart: always

  redis:
    image: redis:7.0-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: always

volumes:
  mysql-data:
  redis-data:
```

### 8.3 使用Docker Compose

```bash
# 启动所有服务
docker-compose up

# 后台启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs

# 查看特定服务的日志
docker-compose logs app

# 进入服务容器
docker-compose exec app /bin/bash

# 停止所有服务
docker-compose down

# 停止所有服务并删除卷
docker-compose down -v

# 构建或重新构建服务
docker-compose build

# 重启服务
docker-compose restart

# 扩展服务
docker-compose up --scale app=3 -d
```

## 9. NestJS应用的Docker实践

### 9.1 创建Dockerfile

#### 9.1.1 开发环境Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
```

#### 9.1.2 生产环境Dockerfile（多阶段构建）

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### 9.2 创建docker-compose.yml

```yaml
version: '3.8'

services:
  nest-app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=nest_app
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mysql
      - redis
    restart: always

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=nest_app
    volumes:
      - mysql-data:/var/lib/mysql
    restart: always

  redis:
    image: redis:7.0-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: always

volumes:
  mysql-data:
  redis-data:
```

### 9.3 部署NestJS应用

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看应用日志
docker-compose logs -f nest-app

# 进入应用容器
docker-compose exec nest-app /bin/sh

# 停止所有服务
docker-compose down
```

### 9.4 健康检查

在Dockerfile或docker-compose.yml中添加健康检查：

#### 9.4.1 在docker-compose.yml中添加健康检查

```yaml
services:
  nest-app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      # ... 其他环境变量
    depends_on:
      - mysql
      - redis
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

#### 9.4.2 在NestJS中实现健康检查端点

```bash
npm install @nestjs/terminus @nestjs/axios
```

```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs', 'http://localhost:3000'),
    ]);
  }
}
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class AppModule {}
```

## 10. Docker最佳实践

### 10.1 镜像最佳实践

- **使用官方基础镜像**：官方镜像经过优化和安全测试，更可靠
- **使用特定版本的基础镜像**：避免使用latest标签，确保构建的一致性
- **使用多阶段构建**：减少最终镜像的大小，只包含必要的文件
- **最小化镜像层数**：合并RUN指令，减少镜像层数
- **清理临时文件**：在每个RUN指令中清理临时文件，减少镜像大小
- **使用.dockerignore文件**：排除不必要的文件，减少上下文大小
- **使用非root用户**：在容器中使用非root用户，提高安全性
- **设置合适的WORKDIR**：设置明确的工作目录，便于后续指令的执行
- **避免在镜像中存储敏感信息**：敏感信息应该通过环境变量或 secrets 传递

### 10.2 容器最佳实践

- **一个容器只运行一个进程**：每个容器应该只负责一个服务
- **使用固定的标签**：避免使用latest标签，确保部署的一致性
- **设置合理的资源限制**：根据服务需求设置CPU和内存限制
- **使用健康检查**：配置健康检查，确保容器正常运行
- **使用 volumes 或 bind mounts 存储数据**：避免将数据存储在容器的可写层
- **设置适当的重启策略**：根据服务需求设置重启策略
- **使用环境变量配置应用**：通过环境变量传递配置，提高灵活性
- **避免在容器中修改配置文件**：配置文件应该通过 volumes 或环境变量传递
- **使用网络隔离**：为不同的服务创建独立的网络，提高安全性

### 10.3 Docker Compose最佳实践

- **使用版本化的docker-compose.yml**：指定docker-compose.yml的版本
- **使用环境变量文件**：将环境变量存储在.env文件中，便于管理
- **使用命名卷**：使用命名卷管理数据，便于备份和恢复
- **设置依赖关系**：使用depends_on设置服务之间的依赖关系
- **使用健康检查**：为服务配置健康检查，确保服务正常运行
- **使用适当的网络配置**：为不同的服务创建独立的网络
- **避免硬编码配置**：使用环境变量和配置文件，提高灵活性

### 10.4 安全性最佳实践

- **定期更新镜像**：定期更新基础镜像和依赖，修复安全漏洞
- **使用非root用户**：在容器中使用非root用户，减少攻击面
- **限制容器权限**：使用--cap-drop和--cap-add限制容器的权限
- **使用只读文件系统**：对于不需要写入的容器，使用--read-only选项
- **使用seccomp配置文件**：限制容器可以调用的系统调用
- **使用AppArmor或SELinux**：为容器提供额外的安全层
- **扫描镜像漏洞**：使用工具如Trivy、Clair等扫描镜像漏洞
- **使用私有仓库**：对于敏感应用，使用私有仓库存储镜像
- **限制网络访问**：使用网络策略限制容器之间的网络访问

## 11. 常见问题和解决方案

### 11.1 容器无法访问外部网络

**解决方案**：
- 检查Docker网络配置
- 检查宿主防火墙设置
- 检查DNS配置
- 使用--network host选项运行容器

### 11.2 容器之间无法通信

**解决方案**：
- 确保容器在同一网络中
- 检查网络配置
- 使用服务名称作为主机名进行通信
- 检查防火墙设置

### 11.3 镜像构建失败

**解决方案**：
- 检查Dockerfile语法
- 检查依赖是否正确
- 检查网络连接
- 检查上下文大小
- 使用--no-cache选项重新构建

### 11.4 容器启动失败

**解决方案**：
- 查看容器日志：`docker logs container-name`
- 检查环境变量配置
- 检查端口冲突
- 检查卷挂载
- 检查健康检查配置

### 11.5 Docker占用过多磁盘空间

**解决方案**：
- 删除未使用的容器：`docker container prune`
- 删除未使用的镜像：`docker image prune -a`
- 删除未使用的卷：`docker volume prune`
- 删除未使用的网络：`docker network prune`
- 使用`docker system prune`清理所有未使用的资源

## 12. 总结

Docker是一种强大的容器化技术，彻底改变了应用程序的部署和管理方式。通过Docker，可以将应用程序及其依赖打包成轻量级、可移植的容器，实现"一次构建，到处运行"。

本章节介绍了Docker的基本概念、核心组件、安装配置、镜像和容器管理、Docker Compose以及NestJS应用的Docker实践。通过学习和实践这些知识，可以更好地利用Docker进行应用程序的开发、测试和部署。

Docker的最佳实践包括使用官方基础镜像、多阶段构建、最小化镜像层数、一个容器只运行一个进程、使用健康检查、设置合理的资源限制等。遵循这些最佳实践，可以创建更加高效、安全和可靠的容器化应用。

随着容器技术的不断发展，Docker已经成为现代应用部署的标准工具之一。掌握Docker技术对于后端开发和运维人员来说是一项重要的技能。