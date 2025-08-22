---
title: Nest Serve
emoji: 🌖
colorFrom: pink
colorTo: indigo
sdk: docker
pinned: false
license: apache-2.0
short_description: nest-serve后端服务
---

# nest-serve

> 使用nest开发的后端服务，可以对接不同的平台
>
> 预览地址：https://www.766187397.dpdns.org



## 版本

node版本>=20



## 功能

- 用户
- 角色
- 路由
- 日志
- 文件上传&大文件上传
- 数据字典
- 通知公告
- AI接口调用：硅基流动对话接口、生成图片接口套壳
  - 日志错误AI分析
  - 用户操作日志统计优化
  - 通知公告润色
  - 图像生成（头像、icon等）

- API文档：knife4j&swagger





## 接口设计

> 自定义接口按照下面的规则开发，但是第三方库有单独的要则按照库的标准来
>
> 平台：当前平台的配置只写了这几个（admin、web、mini、app），如果需要增加修改jwt中的getPlatformJwtConfig

/api/v1/admin/*

- api：表示请求的接口
- v1：接口版本
- admin：平台
  - admin：后台
  - web：web端
  - mini：小程序
  - app：安卓/iOS等
- *：具体的模块接口
- 特殊后缀：后台还需要查询其他平台的数据，后台的大部分接口需要加上平台标识
  - all/:platform
  - info/:platform/:id
    - platform少见，一般使用id不会怎么使用platform
  - platform：admin/web/mini/app等




## 本地运行

### 安装依赖

> 使用镜像、加速器、vpn等可能出现安装失败

```bash
npm i
```



### 环境变量

> .env：开发版本（使用MySQL数据库）
>
> .env.sqlitedb：开发版本（使用sqlite数据库）

[环境变量配置示例](/doc/环境变量配置.md)

```bash
npm run serve

npm run serve:sqlitedb
```



### 打包运行

```bash
npm run build
npm run start:prod
```



### 运行成功

> 运行成功后在控制台会打印

```bash
当前环境为：.env.sqlitedb
server to http://localhost:3000
swagger to http://localhost:3000/swagger
knife4j to http://localhost:3000/doc.html
```

- server：根地址
- swagger：swagger文档
- knife4j：knife4j文档



## Docker部署

> 使用了GitHub自动化上传到了Docker hub

```
docker pull 766187397/nest-serve:latest
```



## 前端项目

gitee：https://gitee.com/sk20020228/admin-vue3-ts

GitHub：https://github.com/766187397/admin-vue3-ts





## 项目结构

```
nest-serve
├── knife4j/												knife4j接口文档静态页面
├── logs/														日志存储地址
├── sqlitedata/											sqlite数据文件
├── src/
│   ├── common/											公共模块
│   │   ├── decorator/							装饰器
│   │   ├── dto/										Dto
│   │   ├── entities/								entities
│   │   ├── filter/									过滤器
│   │   ├── interceptor/						拦截器
│   │   ├── middlewares/						中间件
│   │   ├── pipeTransform/					管道
│   │   ├── service/								服务
│   │   └── utils/									工具函数抽离文件夹
│   ├── config/
│   │   ├── jwt.ts									jwt配置
│   │   ├── logger.ts								日志配置
│   │   ├── multer.ts								文件上传配置
│   │   ├── swagger.ts							接口文档API
│   │   └── whiteList.ts						白名单文档
│   ├── module/
│   │   ├── auth/										授权模块
│   │   ├── default-data/						默认数据（生成默认数据方便使用）
│   │   ├── dictionary/							数据字典
│   │   ├── knife4j/								knife4j接口文档
│   │   ├── logger/									日志接口
│   │   ├── notice/									通知公告
│   │   ├── roles/									角色
│   │   ├── routes/									路由
│   │   ├── upload/									文件上传
│   │   └── users/									用户
│   ├── types/											类型抽离文件夹
│   ├── app.module.ts
│   └── main.ts
├── types/
│   └── global.d.ts
├── uploads/												文件上传存储位置
├── .env.dev
├── .env.prod
├── .env.sqlitedb
├── eslint.config.mjs
├── nest-cli.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.build.json
└── tsconfig.json
```





## 截图

![image-20250804184851090](example/image-20250804184851090.png)





![image-20250804185031690](example/image-20250804185031690.png)
