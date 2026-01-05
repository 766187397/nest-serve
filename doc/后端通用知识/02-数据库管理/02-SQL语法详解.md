# SQL语法详解

SQL（Structured Query Language）是用于管理关系型数据库的标准语言。它允许用户查询、插入、更新和删除数据库中的数据，以及创建、修改和删除数据库对象。

## 一、SQL分类

SQL语句根据其功能可以分为以下几类：

| 分类 | 英文全称 | 主要功能 | 常用命令 |
|------|----------|----------|----------|
| DDL | Data Definition Language | 定义数据库结构 | CREATE, ALTER, DROP, TRUNCATE |
| DML | Data Manipulation Language | 操作数据库数据 | INSERT, UPDATE, DELETE |
| DQL | Data Query Language | 查询数据库数据 | SELECT |
| DCL | Data Control Language | 控制数据库权限 | GRANT, REVOKE |
| TCL | Transaction Control Language | 控制事务 | BEGIN, COMMIT, ROLLBACK, SAVEPOINT |

## 二、数据定义语言(DDL)

### 1. CREATE - 创建数据库对象

#### 创建数据库
```sql
-- 创建数据库
CREATE DATABASE mydb;

-- 创建数据库并指定字符集
CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 创建表
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INT DEFAULT 18,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 创建索引
```sql
-- 创建普通索引
CREATE INDEX idx_users_username ON users(username);

-- 创建唯一索引
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- 创建复合索引
CREATE INDEX idx_users_age_created ON users(age, created_at);
```

#### 创建视图
```sql
CREATE VIEW active_users AS
SELECT id, username, email, created_at
FROM users
WHERE status = 'active';
```

### 2. ALTER - 修改数据库对象

#### 修改表结构
```sql
-- 添加列
ALTER TABLE users ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active';

-- 修改列类型
ALTER TABLE users MODIFY COLUMN age TINYINT;

-- 修改列名
ALTER TABLE users CHANGE COLUMN updated_at updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 删除列
ALTER TABLE users DROP COLUMN status;

-- 添加外键约束
ALTER TABLE orders ADD CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES users(id);

-- 删除外键约束
ALTER TABLE orders DROP FOREIGN KEY fk_orders_user_id;
```

### 3. DROP - 删除数据库对象

```sql
-- 删除数据库
DROP DATABASE mydb;

-- 删除表
DROP TABLE users;

-- 删除视图
DROP VIEW active_users;

-- 删除索引
DROP INDEX idx_users_username ON users;
```

### 4. TRUNCATE - 清空表数据

```sql
-- 清空表数据，但保留表结构
TRUNCATE TABLE users;
```

## 三、数据操纵语言(DML)

### 1. INSERT - 插入数据

#### 插入单行数据
```sql
-- 插入全部列
INSERT INTO users (username, email, password, age) 
VALUES ('john', 'john@example.com', 'password123', 25);

-- 插入部分列（其他列使用默认值）
INSERT INTO users (username, email, password) 
VALUES ('jane', 'jane@example.com', 'password456');
```

#### 插入多行数据
```sql
INSERT INTO users (username, email, password, age) 
VALUES 
    ('bob', 'bob@example.com', 'password789', 30),
    ('alice', 'alice@example.com', 'password012', 28),
    ('charlie', 'charlie@example.com', 'password345', 35);
```

#### 从其他表插入数据
```sql
-- 假设已有users_backup表，结构与users相同
INSERT INTO users (username, email, password, age) 
SELECT username, email, password, age 
FROM users_backup 
WHERE created_at > '2025-01-01';
```

### 2. UPDATE - 更新数据

```sql
-- 更新单行数据
UPDATE users 
SET age = 26, updated_at = CURRENT_TIMESTAMP 
WHERE id = 1;

-- 更新多行数据
UPDATE users 
SET status = 'inactive' 
WHERE last_login < '2025-01-01';

-- 使用子查询更新
UPDATE users 
SET age_group = 'young' 
WHERE age < (SELECT AVG(age) FROM users);
```

### 3. DELETE - 删除数据

```sql
-- 删除单行数据
DELETE FROM users WHERE id = 1;

-- 删除多行数据
DELETE FROM users WHERE status = 'inactive';

-- 删除所有数据（保留表结构，与TRUNCATE的区别是DELETE可以回滚）
DELETE FROM users;

-- 使用子查询删除
DELETE FROM users 
WHERE id IN (SELECT user_id FROM inactive_users);
```

## 四、数据查询语言(DQL)

### 1. 基本SELECT语句

```sql
-- 查询所有列
SELECT * FROM users;

-- 查询指定列
SELECT id, username, email FROM users;

-- 使用别名
SELECT id AS user_id, username AS name, email FROM users;

-- 去重查询
SELECT DISTINCT age FROM users;
```

### 2. WHERE子句 - 条件过滤

```sql
-- 基本条件
SELECT * FROM users WHERE age > 25;

-- 逻辑运算符
SELECT * FROM users WHERE age > 25 AND status = 'active';
SELECT * FROM users WHERE age > 30 OR status = 'inactive';
SELECT * FROM users WHERE NOT status = 'inactive';

-- 范围查询
SELECT * FROM users WHERE age BETWEEN 25 AND 35;
SELECT * FROM users WHERE id IN (1, 3, 5, 7);
SELECT * FROM users WHERE id NOT IN (2, 4, 6, 8);

-- 模糊查询
SELECT * FROM users WHERE username LIKE 'j%'; -- 以j开头
SELECT * FROM users WHERE username LIKE '%n'; -- 以n结尾
SELECT * FROM users WHERE username LIKE '%oh%'; -- 包含oh
SELECT * FROM users WHERE username NOT LIKE '%admin%'; -- 不包含admin

-- NULL值处理
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;
```

### 3. JOIN - 表连接

#### INNER JOIN - 内连接
```sql
-- 查询订单及其对应的用户信息
SELECT o.id AS order_id, o.order_no, o.amount, u.username, u.email
FROM orders o
INNER JOIN users u ON o.user_id = u.id;
```

#### LEFT JOIN - 左连接
```sql
-- 查询所有用户及其订单（包括没有订单的用户）
SELECT u.id AS user_id, u.username, o.id AS order_id, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

#### RIGHT JOIN - 右连接
```sql
-- 查询所有订单及其对应的用户（包括没有匹配用户的订单）
SELECT o.id AS order_id, o.order_no, u.id AS user_id, u.username
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

#### FULL JOIN - 全连接
```sql
-- 查询所有用户和所有订单（包括没有匹配的用户和订单）
-- MySQL不直接支持FULL JOIN，可以用UNION模拟
SELECT u.id AS user_id, u.username, o.id AS order_id, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
UNION
SELECT u.id AS user_id, u.username, o.id AS order_id, o.order_no
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

#### CROSS JOIN - 交叉连接
```sql
-- 查询用户和产品的所有组合（笛卡尔积）
SELECT u.username, p.product_name
FROM users u
CROSS JOIN products p;
```

### 4. GROUP BY - 分组查询

```sql
-- 统计每个年龄的用户数量
SELECT age, COUNT(*) AS user_count
FROM users
GROUP BY age;

-- 统计每个用户的订单数量和总金额
SELECT u.username, COUNT(o.id) AS order_count, SUM(o.amount) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- HAVING用于过滤分组后的结果
SELECT u.username, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
HAVING COUNT(o.id) > 5;
```

### 5. ORDER BY - 排序

```sql
-- 升序排序
SELECT * FROM users ORDER BY age ASC;

-- 降序排序
SELECT * FROM users ORDER BY created_at DESC;

-- 多列排序
SELECT * FROM users ORDER BY age ASC, created_at DESC;

-- NULL值排序
SELECT * FROM users ORDER BY email IS NULL, email ASC;
```

### 6. LIMIT - 分页查询

```sql
-- 查询前10条数据
SELECT * FROM users LIMIT 10;

-- 分页查询（第2页，每页10条）
SELECT * FROM users LIMIT 10 OFFSET 10;
-- 或等价写法
SELECT * FROM users LIMIT 10, 10;
```

## 五、数据控制语言(DCL)

### 1. GRANT - 授予权限

```sql
-- 授予用户所有权限
GRANT ALL PRIVILEGES ON mydb.* TO 'user'@'localhost' IDENTIFIED BY 'password';

-- 授予特定权限
GRANT SELECT, INSERT, UPDATE ON mydb.users TO 'user'@'localhost';

-- 授予带权限授予的权限
GRANT SELECT ON mydb.* TO 'user'@'localhost' WITH GRANT OPTION;

-- 刷新权限
FLUSH PRIVILEGES;
```

### 2. REVOKE - 收回权限

```sql
-- 收回特定权限
REVOKE DELETE ON mydb.users FROM 'user'@'localhost';

-- 收回所有权限
REVOKE ALL PRIVILEGES ON mydb.* FROM 'user'@'localhost';
```

## 六、事务控制语言(TCL)

```sql
-- 开始事务
START TRANSACTION;
-- 或 BEGIN;

-- 执行一系列DML操作
INSERT INTO orders (user_id, order_no, amount) VALUES (1, 'ORD-2025-001', 100.00);
UPDATE users SET total_orders = total_orders + 1 WHERE id = 1;

-- 保存点
SAVEPOINT order_created;

-- 更多操作
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 1;

-- 回滚到保存点
ROLLBACK TO order_created;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;
```

## 七、常用函数

### 1. 聚合函数

```sql
-- 统计记录数
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(DISTINCT age) AS unique_ages FROM users;

-- 求和
SELECT SUM(amount) AS total_revenue FROM orders;

-- 平均值
SELECT AVG(age) AS avg_age FROM users;

-- 最大值和最小值
SELECT MAX(amount) AS max_order, MIN(amount) AS min_order FROM orders;
```

### 2. 字符串函数

```sql
-- 字符串长度
SELECT username, LENGTH(username) AS name_length FROM users;

-- 字符串拼接
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users;

-- 字符串转换
SELECT UPPER(username) AS upper_name, LOWER(username) AS lower_name FROM users;

-- 字符串截取
SELECT SUBSTRING(email, 1, 5) AS email_prefix FROM users;

-- 字符串替换
SELECT REPLACE(email, '@example.com', '@newdomain.com') AS new_email FROM users;

-- 去除空格
SELECT TRIM(username) AS trimmed_name FROM users;
```

### 3. 日期和时间函数

```sql
-- 当前日期和时间
SELECT NOW() AS current_datetime;
SELECT CURDATE() AS current_date;
SELECT CURTIME() AS current_time;

-- 日期格式化
SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS formatted_date FROM users;
SELECT DATE_FORMAT(created_at, '%H:%i:%s') AS formatted_time FROM users;
SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS formatted_datetime FROM users;

-- 日期计算
SELECT DATE_ADD(created_at, INTERVAL 7 DAY) AS next_week FROM users;
SELECT DATE_SUB(created_at, INTERVAL 1 MONTH) AS last_month FROM users;
SELECT DATEDIFF(NOW(), created_at) AS days_since_creation FROM users;

-- 提取日期部分
SELECT YEAR(created_at) AS year, MONTH(created_at) AS month, DAY(created_at) AS day FROM users;
SELECT HOUR(created_at) AS hour, MINUTE(created_at) AS minute, SECOND(created_at) AS second FROM users;
```

### 4. 数值函数

```sql
-- 四舍五入
SELECT ROUND(amount, 2) AS rounded_amount FROM orders;

-- 向上取整
SELECT CEIL(amount) AS ceil_amount FROM orders;

-- 向下取整
SELECT FLOOR(amount) AS floor_amount FROM orders;

-- 取绝对值
SELECT ABS(difference) AS absolute_difference FROM metrics;

-- 生成随机数
SELECT RAND() AS random_number;
SELECT FLOOR(RAND() * 100) AS random_int_0_99;
```

## 八、子查询和CTE

### 1. 子查询

```sql
-- 单行子查询
SELECT * FROM users WHERE age = (SELECT MAX(age) FROM users);

-- 多行子查询
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE amount > 100);

-- 关联子查询
SELECT u.username, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
FROM users u;

--  EXISTS子查询
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- NOT EXISTS子查询
SELECT * FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

### 2. 通用表表达式(CTE) - WITH子句

```sql
-- 基本CTE
WITH user_orders AS (
    SELECT u.id AS user_id, u.username, COUNT(o.id) AS order_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    GROUP BY u.id, u.username
)
SELECT * FROM user_orders WHERE order_count > 5;

-- 递归CTE（用于查询层级结构，如部门树）
WITH RECURSIVE department_hierarchy AS (
    -- 初始查询（根节点）
    SELECT id, name, parent_id, 1 AS level
    FROM departments
    WHERE parent_id IS NULL
    UNION ALL
    -- 递归查询
    SELECT d.id, d.name, d.parent_id, dh.level + 1 AS level
    FROM departments d
    INNER JOIN department_hierarchy dh ON d.parent_id = dh.id
)
SELECT * FROM department_hierarchy ORDER BY level, id;
```

## 九、索引和约束

### 1. 索引类型

| 索引类型 | 描述 | 适用场景 |
|----------|------|----------|
| 普通索引 | 最基本的索引，没有任何限制 | 常用于频繁查询的列 |
| 唯一索引 | 索引列的值必须唯一，但允许有空值 | 用于唯一标识的列，如邮箱、手机号 |
| 主键索引 | 特殊的唯一索引，不允许有空值 | 用于表的主键 |
| 复合索引 | 多个列组合而成的索引 | 用于多列查询条件 |
| 全文索引 | 用于全文搜索 | 用于长文本列的搜索 |
| 空间索引 | 用于地理空间数据类型 | 用于地理位置查询 |

### 2. 约束类型

| 约束类型 | 描述 |
|----------|------|
| PRIMARY KEY | 主键约束，唯一标识表中的每一行 |
| UNIQUE | 唯一约束，确保列的值唯一 |
| NOT NULL | 非空约束，确保列不能有空值 |
| FOREIGN KEY | 外键约束，确保列的值引用另一个表的主键 |
| CHECK | 检查约束，确保列的值满足特定条件 |
| DEFAULT | 默认值约束，为列设置默认值 |

## 十、SQL最佳实践

### 1. 查询优化

- 只查询需要的列，避免使用SELECT *
- 使用索引优化查询性能
- 避免在WHERE子句中对列进行函数操作
- 合理使用JOIN，避免不必要的连接
- 使用LIMIT限制返回的数据量
- 避免在循环中执行SQL语句

### 2. 安全实践

- 使用参数化查询，防止SQL注入
- 最小权限原则，只授予必要的权限
- 定期备份数据库
- 加密敏感数据
- 避免在SQL中硬编码敏感信息

### 3. 代码风格

- 使用大写字母编写SQL关键字
- 合理缩进和换行，提高可读性
- 使用表别名，简化查询
- 添加注释，说明复杂查询的目的
- 保持一致性，遵循团队约定的命名规范

## 十一、NestJS中使用SQL

### 1. 使用TypeORM

```typescript
// 实体定义
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 18 })
  age: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// 服务中使用
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // 使用Repository查询
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 使用Query Builder
  async findActiveUsers(): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.age > :age', { age: 18 })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  // 使用原生SQL
  async findUsersWithOrders(): Promise<any[]> {
    return this.dataSource.query(`
      SELECT u.id, u.username, COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.username
    `);
  }
}
```

### 2. 使用Prisma

```typescript
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  age       Int      @default(18)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
}

// 服务中使用
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findUsersWithOrders(): Promise<any[]> {
    return this.prisma.$queryRaw`
      SELECT u.id, u.username, COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.username
    `;
  }
}
```

## 十二、常见问题与解决方案

### 1. SQL注入

**问题**：用户输入直接拼接到SQL语句中，导致恶意代码执行。

**解决方案**：使用参数化查询或ORM框架。

**错误示例**：
```javascript
const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

**正确示例**：
```javascript
// 使用参数化查询
const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.query(sql, [username, password]);

// 使用TypeORM Query Builder
this.userRepository
  .createQueryBuilder('user')
  .where('user.username = :username', { username })
  .andWhere('user.password = :password', { password })
  .getOne();
```

### 2. 慢查询

**问题**：查询执行时间过长，影响系统性能。

**解决方案**：
- 分析执行计划：使用EXPLAIN命令
- 添加合适的索引
- 优化查询语句
- 避免全表扫描

**示例**：
```sql
-- 分析执行计划
EXPLAIN SELECT * FROM users WHERE age > 25;
```

### 3. 死锁

**问题**：两个或多个事务互相等待对方释放资源，导致无限等待。

**解决方案**：
- 保持事务简短
- 统一锁顺序
- 设置合理的锁超时
- 避免长时间占用锁

**示例**：
```sql
-- 设置锁超时
SET innodb_lock_wait_timeout = 50;
```

## 十三、总结

SQL是后端开发的核心技能之一，掌握SQL语法对于前端开发者学习后端开发至关重要。本文档涵盖了SQL的核心语法和最佳实践，包括数据定义、数据操纵、数据查询、事务处理等内容。

通过学习和实践SQL，前端开发者可以更好地理解后端数据处理逻辑，与后端开发者更高效地协作，构建完整的Web应用。

## 参考资源

- [MySQL中文文档](https://www.mysqlzh.com/)
- [PostgreSQL中文文档](https://www.postgresql.org/docs/current/)
- [SQLite中文文档](https://www.sqlite.org/docs.html)
- [W3Schools SQL教程](https://www.w3school.com.cn/sql/)
- [MDN SQL教程](https://developer.mozilla.org/zh-CN/docs/Web/SQL)