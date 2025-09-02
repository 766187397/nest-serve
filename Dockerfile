FROM node:20

# 设置工作目录（/app 是随便起的，下面会解释）
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源码
COPY . .

# 构建项目（NestJS 默认编译到 dist）
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动生产模式
# CMD ["node", "dist/main"]
CMD ["npm", "start"]