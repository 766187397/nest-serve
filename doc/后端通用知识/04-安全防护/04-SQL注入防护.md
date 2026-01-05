# SQL注入防护

## 1. SQL注入概述

SQL注入是一种常见的Web安全漏洞，攻击者通过在输入中插入恶意SQL代码，破坏原有SQL语句的结构，从而执行未授权的数据库操作。

### 1.1 SQL注入的危害

- 未授权访问数据库
- 数据泄露（敏感信息窃取）
- 数据篡改或删除
- 数据库服务器被完全控制
- 绕过认证机制

### 1.2 SQL注入的常见场景

- 用户登录表单
- 搜索功能
- URL参数
- 表单提交
- API请求参数

## 2. SQL注入的工作原理

### 2.1 基本注入示例

假设有一个登录表单，后端代码如下：

```typescript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

攻击者输入：
- username: `admin' --`
- password: 任意值

最终执行的SQL：
```sql
SELECT * FROM users WHERE username = 'admin' --' AND password = '任意值'
```

### 2.2 高级注入技术

- 联合查询注入（UNION-based）
- 报错注入（Error-based）
- 盲注（Blind Injection）
  - 布尔盲注
  - 时间盲注
- 堆叠查询注入（Stacked Queries）

## 3. SQL注入预防技术

### 3.1 参数化查询

参数化查询是预防SQL注入的最有效方法，将SQL语句与数据分离，确保数据不会被解释为SQL代码。

#### 3.1.1 原生SQL的参数化查询

```typescript
// 不安全的方式
const query = `SELECT * FROM users WHERE id = ${id}`;

// 安全的参数化查询
const query = 'SELECT * FROM users WHERE id = ?';
const result = await connection.query(query, [id]);
```

#### 3.1.2 命名参数

```typescript
const query = 'SELECT * FROM users WHERE id = :id';
const result = await connection.query(query, { id });
```

### 3.2 使用ORM框架

ORM框架通常会自动处理SQL注入防护，使用参数化查询或预处理语句。

### 3.3 输入验证与过滤

- 数据类型验证
- 长度限制
- 白名单验证
- 特殊字符转义

### 3.4 最小权限原则

- 为应用程序分配最小必要的数据库权限
- 避免使用SA或root账户
- 限制数据库用户的操作范围

### 3.5 存储过程

使用存储过程可以减少直接拼接SQL的机会，但需确保存储过程本身没有注入漏洞。

## 4. NestJS中的SQL注入防护

### 4.1 使用TypeORM防止SQL注入

TypeORM是NestJS常用的ORM框架，默认使用参数化查询。

#### 4.1.1 基本查询

```typescript
// 安全的查询方式
const user = await this.userRepository.findOne({
  where: {
    id: userId,
    status: 'active'
  }
});
```

#### 4.1.2 Query Builder

```typescript
const users = await this.userRepository
  .createQueryBuilder('user')
  .where('user.age > :age', { age: 18 })
  .andWhere('user.status = :status', { status: 'active' })
  .getMany();
```

#### 4.1.3 Raw SQL查询

```typescript
// 安全的原生SQL查询
const users = await this.userRepository.query(
  'SELECT * FROM users WHERE age > :age AND status = :status',
  { age: 18, status: 'active' }
);
```

### 4.2 使用Prisma防止SQL注入

Prisma是另一个流行的ORM框架，提供了类型安全的查询API。

#### 4.2.1 基本查询

```typescript
const user = await this.prisma.user.findUnique({
  where: {
    id: userId
  }
});
```

#### 4.2.2 条件查询

```typescript
const users = await this.prisma.user.findMany({
  where: {
    age: {
      gt: 18
    },
    status: 'active'
  }
});
```

### 4.3 直接使用数据库驱动

如果需要直接使用数据库驱动，如mysql2，应使用参数化查询。

```typescript
@Injectable()
export class UserService {
  constructor(@InjectConnection() private connection: Connection) {}

  async getUserById(id: number) {
    // 使用参数化查询
    const [rows] = await this.connection.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}
```

## 5. 常见错误模式与避免方法

### 5.1 不安全的字符串拼接

**错误示例**：
```typescript
const query = `SELECT * FROM users WHERE name = '${name}'`;
```

**正确示例**：
```typescript
const query = 'SELECT * FROM users WHERE name = ?';
const result = await connection.query(query, [name]);
```

### 5.2 不安全的ORM查询

**错误示例**：
```typescript
// 不安全！直接拼接SQL片段
const users = await this.userRepository
  .createQueryBuilder('user')
  .where(`user.${field} = :value`, { value })
  .getMany();
```

**正确示例**：
```typescript
// 安全的动态字段查询
const users = await this.userRepository
  .createQueryBuilder('user')
  .where({ [field]: value })
  .getMany();
```

### 5.3 不安全的原生查询

**错误示例**：
```typescript
const query = `SELECT * FROM users WHERE ${condition}`;
const result = await connection.query(query);
```

**正确示例**：
```typescript
// 使用安全的方式构建动态查询
const queryBuilder = this.userRepository.createQueryBuilder('user');

if (condition1) {
  queryBuilder.andWhere('user.field1 = :value1', { value1 });
}

if (condition2) {
  queryBuilder.andWhere('user.field2 = :value2', { value2 });
}

const users = await queryBuilder.getMany();
```

## 6. 测试与审计

### 6.1 代码审计

- 检查所有数据库查询是否使用参数化查询
- 审查ORM使用是否正确
- 检查输入验证逻辑

### 6.2 渗透测试

- 使用自动化工具（如OWASP ZAP、SQLMap）进行测试
- 手动测试常见注入点
- 测试边缘情况

### 6.3 静态代码分析

- 使用ESLint插件检测不安全的SQL拼接
- 集成安全扫描工具到CI/CD流程

## 7. 最佳实践

1. **始终使用参数化查询**：这是预防SQL注入的核心
2. **优先使用ORM框架**：ORM提供了额外的安全层
3. **实施严格的输入验证**：验证所有用户输入
4. **遵循最小权限原则**：限制数据库用户权限
5. **定期更新依赖**：及时修复已知安全漏洞
6. **进行安全测试**：定期进行渗透测试和代码审计
7. **使用安全头部**：如Content-Security-Policy
8. **记录和监控**：记录异常查询行为

## 8. 案例分析

### 8.1 实际SQL注入漏洞

**案例**：某电商网站的产品搜索功能存在SQL注入漏洞

**漏洞代码**：
```typescript
const query = `SELECT * FROM products WHERE name LIKE '%${keyword}%'`;
const products = await connection.query(query);
```

**攻击向量**：`keyword`参数输入 `' UNION SELECT credit_card FROM users --`

**修复方法**：
```typescript
const query = 'SELECT * FROM products WHERE name LIKE :keyword';
const products = await connection.query(query, {
  keyword: `%${keyword}%`
});
```

### 8.2 修复后的安全实现

使用TypeORM的Query Builder：

```typescript
const products = await this.productRepository
  .createQueryBuilder('product')
  .where('product.name LIKE :keyword', {
    keyword: `%${keyword}%`
  })
  .getMany();
```

## 9. 总结

SQL注入是一种严重的安全威胁，但通过采取适当的预防措施，可以有效避免。在NestJS应用中，主要防护措施包括：

- 使用参数化查询
- 优先使用ORM框架（TypeORM或Prisma）
- 实施严格的输入验证
- 遵循最小权限原则
- 定期进行安全测试和代码审计

通过结合这些措施，可以构建出安全可靠的NestJS应用，有效抵御SQL注入攻击。