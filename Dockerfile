# 使用Node.js  20官方镜像
FROM node:20
 
# 设置工作目录为根目录（按您要求）
WORKDIR /
 
# 复制项目所有文件（使用.dockerignore优化构建）
COPY . .
 
# 安装依赖（使用npm ci确保版本锁定）
RUN npm ci --omit=dev 
 
# 构建应用（按您要求的打包命令）
RUN npm run build
 
# 暴露端口3000（按您要求）
EXPOSE 3000
 
# 启动应用（按您要求的运行命令）
CMD ["npm", "run", "start"]