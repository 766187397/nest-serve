1. **修改基础查询DTO**：在`FindByParameter`类中添加`platform`字段，用于admin平台查询任意平台数据
2. **创建通用查询条件处理工具**：

   * 在`src/common/utils`目录下创建`query.util.ts`文件

   * 实现`handlePlatformQuery`函数，处理platform查询逻辑

   * 函数逻辑：当请求平台为admin且提供了platform参数时，使用该参数；否则使用请求头中的platform
3. **修改现有Service的查询方法**：

   * 更新`users.service.ts`、`roles.service.ts`等所有包含platform查询的Service

   * 使用通用工具函数处理platform查询条件
4. **测试验证**：确保admin平台可以通过platform参数查询任意平台数据，其他平台只能查询自身平台数据

**设计思路**：

* 利用现有的DTO继承结构，在基础查询类中添加platform字段，实现所有查询DTO的复用

* 通过通用工具函数统一处理platform查询逻辑，避免重复代码

* 保持现有代码结构不变，最小化修改范围

* 确保代码的可维护性和扩展性，方便后续修改平台相关逻辑

