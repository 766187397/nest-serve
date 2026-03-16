/**
 * 敏感信息过滤工具
 * 用于过滤日志和异常中的敏感信息，如密码、token等
 */

/**
 * 敏感字段列表（小写）
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwd',
  'pwd',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret',
  'apikey',
  'api_key',
  'apikey',
  'privatekey',
  'private_key',
  'idcard',
  'id_card',
  'bankcard',
  'bank_card',
  'creditcard',
  'credit_card',
  'ssn',
  'social_security_number',
  'phone',
  'mobile',
  'telephone',
  'email',
  'address',
  // 中文敏感字段
  '密码',
  '令牌',
  '密钥',
  '身份证',
  '银行卡',
  '手机号',
  '电话',
  '邮箱',
  '地址',
];

/**
 * 敏感信息替换字符串
 */
const SENSITIVE_MASK = '******';

/**
 * 过滤对象中的敏感信息
 * @param {unknown} data - 需要过滤的数据
 * @param {string} mask - 替换字符串，默认为 '******'
 * @returns {unknown} 过滤后的数据
 * @description 递归遍历对象，将敏感字段的值替换为掩码
 * @example
 * const data = { username: 'test', password: '123456', token: 'abc123' };
 * const filtered = filterSensitiveData(data);
 * console.log(filtered);
 * // 输出: { username: 'test', password: '******', token: '******' }
 */
export function filterSensitiveData(data: unknown, mask: string = SENSITIVE_MASK): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => filterSensitiveData(item, mask));
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const lowerKey = key.toLowerCase();

        if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
          result[key] = mask;
        } else {
          result[key] = filterSensitiveData((data as Record<string, unknown>)[key], mask);
        }
      }
    }

    return result;
  }

  return data;
}

/**
 * 过滤错误对象中的敏感信息
 * @param {Error} error - 错误对象
 * @param {string} mask - 替换字符串，默认为 '******'
 * @returns {Record<string, unknown>} 过滤后的错误信息
 * @description 过滤错误对象中的敏感信息，包括消息、堆栈等
 * @example
 * try {
 *   throw new Error('Password: 123456 is invalid');
 * } catch (error) {
 *   const filtered = filterErrorSensitiveData(error as Error);
 *   console.log(filtered);
 *   // 输出: { message: 'Password: ****** is invalid', stack: '...' }
 * }
 */
export function filterErrorSensitiveData(error: Error, mask: string = SENSITIVE_MASK): Record<string, unknown> {
  const result: Record<string, unknown> = {
    name: error.name,
    message: filterSensitiveString(error.message, mask),
  };

  if (error.stack) {
    result.stack = filterSensitiveString(error.stack, mask);
  }

  return result;
}

/**
 * 过滤字符串中的敏感信息
 * @param {string} str - 需要过滤的字符串
 * @param {string} mask - 替换字符串，默认为 '******'
 * @returns {string} 过滤后的字符串
 * @description 使用正则表达式匹配并替换字符串中的敏感信息
 * @example
 * const str = 'password=123456&token=abc123';
 * const filtered = filterSensitiveString(str);
 * console.log(filtered);
 * // 输出: 'password=******&token=******'
 */
export function filterSensitiveString(str: string, mask: string = SENSITIVE_MASK): string {
  if (!str || typeof str !== 'string') {
    return str;
  }

  let result = str;

  for (const field of SENSITIVE_FIELDS) {
    // 匹配 "字段名: 值" 或 "字段名=值" 或 "字段名是值" 等格式
    // 使用非贪婪匹配，匹配到下一个空格或特殊字符为止
    const regex = new RegExp(
      `(${field}\\s*[:=是]\\s*)([^\\s"'\\)\\}\\n\\r]+)`,
      'gi'
    );
    result = result.replace(regex, `$1${mask}`);
  }

  return result;
}

/**
 * 添加自定义敏感字段
 * @param {string[]} fields - 需要添加的敏感字段列表
 * @description 动态添加敏感字段到过滤列表
 * @example
 * addSensitiveFields(['customField', 'anotherField']);
 */
export function addSensitiveFields(fields: string[]): void {
  for (const field of fields) {
    const lowerField = field.toLowerCase();
    if (!SENSITIVE_FIELDS.includes(lowerField)) {
      SENSITIVE_FIELDS.push(lowerField);
    }
  }
}

/**
 * 获取当前敏感字段列表
 * @returns {string[]} 敏感字段列表
 * @description 获取当前配置的所有敏感字段
 * @example
 * const fields = getSensitiveFields();
 * console.log(fields);
 * // 输出: ['password', 'token', ...]
 */
export function getSensitiveFields(): string[] {
  return [...SENSITIVE_FIELDS];
}
