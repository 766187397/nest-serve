# nest-serve

> 使用nest开发的后端服务，可以对接不同的平台



## 版本

node版本>=20



## 功能

- 用户
- 角色
- 路由
- 日志
- 文件上传
- 数据字典
- 通知公告





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

```bash
npm i
```



### 运行版本

> dev：开发版本（使用MySQL数据库）
>
> prod：生产版本（使用MySQL数据库）
>
> sqlitedb：开发版本（使用sqlite数据库）

```bash
npm run serve:dev
npm run serve:prod
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





## 根实体定义

> common/entities/base
>
> 项目的实体都继承与这个跟实体

**重点字段**

- id：唯一标识
  - 使用的uuid，方便使用多数据库，也防止修改id防止泄露其他的用户信息
- platform：平台标识：admin/web/app/mini

