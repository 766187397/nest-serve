/**
 * 传入Object对象，删除空值
 * @param {Object} obj Object对象
 * @returns {Object} Object对象
 */
export function ObjectFilterAbnormal<T extends object>(obj: T): T {
  // 删除空值
  for (const key in obj) {
    if (obj[key] === undefined || obj[key] === null) {
      delete obj[key];
    }
  }
  return obj;
}

/**
 * 统一计算分页函数
 * @param {number|string} page 页码
 * @param {number|string} pageSize 每页数量
 * @returns {Object} {take:number,skip:number}
 * @throws {Error} page和pageSize必须为正整数或字符串形式的正整数
 */
export function calculatePagination(
  page: number | string = 1,
  pageSize: number | string = 10
): { take: number; skip: number } | Error {
  page = +page;
  pageSize = +pageSize;
  if (!Number.isInteger(page) || !Number.isInteger(pageSize)) {
    throw new Error("page和pageSize必须为正整数或字符串形式的正整数");
  }
  if (page < 1) {
    return new Error("page不能小于1");
  }
  if (pageSize < 1) {
    return new Error("pageSize不能小于1");
  }
  // 计算take和skip
  const take = pageSize;
  const skip = (page - 1) * pageSize;
  return { take, skip };
}

/**
 * 随机字符串生成函数
 * @param {number} length 生成的字符串长度
 * @param {string} chars 生成字符串的字符集
 * @returns {string} 随机字符串
 */
export function generateRandomString(
  length: number,
  chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}
