import { Between, FindOptionsOrderValue } from 'typeorm';
import * as dayjs from 'dayjs';
import { svgCache } from '@/config/nodeCache';

interface VerifyParams {
  code: string;
  codeKey: string;
}

interface CaptchaCache {
  text: string;
}

/**
 * 通用的处理查询条件
 * @param {object} query 查询条件
 * @returns {{ [key: string]: unknown }} 处理后的查询条件
 * @description 该函数用于处理通用的查询条件，包括状态筛选和时间范围筛选
 * @example
 * const query = { status: 1, time: '2024-01-01,2024-01-31' };
 * const where = buildCommonQuery(query);
 * // where = { status: 1, createdAt: Between(start, end) }
 */
export function buildCommonQuery(
  query: unknown
): Record<string, unknown> {
  if (typeof query === 'undefined' || query === null) {
    return {};
  }
  const queryObj = query as Record<string, unknown>;
  const where: Record<string, unknown> = {};
  if (queryObj.status) {
    where.status = queryObj.status;
  }
  let time: string[] = [];
  if (typeof queryObj.time === 'string') {
    time = queryObj.time.split(/[,，、到至]+/);
  } else if (Array.isArray(queryObj.time)) {
    time = queryObj.time as string[];
  }
  if (time.length == 2) {
    const start = dayjs(time[0]).startOf('day').toDate();
    const end = dayjs(time[1]).endOf('day').toDate();
    where.createdAt = Between(start, end);
  }
  return where;
}

/**
 * 处理默认排序 处理createdAt和id
 * @param {FindOptionsOrderValue} sort 排序条件sort DESC | ASC
 * @returns {{[key: string]: FindOptionsOrderValue}} 处理后的排序条件
 * @description 该函数用于处理通用的排序条件，默认按sort和createdAt降序排序
 * @example
 * const sort = buildCommonSort('ASC');
 * // sort = { sort: 'ASC', createdAt: 'ASC' }
 */
export function buildCommonSort(sort?: FindOptionsOrderValue): {
  [key: string]: FindOptionsOrderValue;
} {
  const sortAll = ['ASC', 'DESC', 'asc', 'desc'];

  if (typeof sort === 'undefined') {
    return { sort: 'DESC', createdAt: 'DESC' };
  }
  if (sortAll.includes(sort as string)) {
    return { sort: sort, createdAt: sort };
  }
  return { sort: 'DESC', createdAt: 'DESC' };
}

/**
 * 统一计算分页函数
 * @param {number|string} page 页码
 * @param {number|string} pageSize 每页数量
 * @returns {Object} {take:number,skip:number}
 * @throws {Error} page和pageSize必须为正整数或字符串形式的正整数
 * @description 该函数用于计算分页的take和skip参数，用于TypeORM的findAndCount等方法
 * @example
 * const { take, skip } = buildCommonPaging(2, 10);
 * // take = 10, skip = 10
 */
export function buildCommonPaging(
  page: number | string = 1,
  pageSize: number | string = 10
): { take: number; skip: number } {
  page = +page;
  pageSize = +pageSize;
  if (!Number.isInteger(page) || !Number.isInteger(pageSize)) {
    throw new Error('page和pageSize必须为正整数或字符串形式的正整数');
  }
  if (page < 1) {
    throw new Error('page不能小于1');
  }
  if (pageSize < 1) {
    throw new Error('pageSize不能小于1');
  }
  const take = pageSize;
  const skip = (page - 1) * pageSize;
  return { take, skip };
}

/**
 * 校验验证码是否正确
 * @param {VerifyParams} param 验证码参数
 * @param {string} param.code 验证码
 * @param {string} param.codeKey 验证码KEY
 * @returns {Promise<boolean>} true 为正确, false 为错误
 * @description 该函数用于校验图形验证码是否正确，验证成功后会删除缓存的验证码
 * @example
 * const isValid = await buildVerify({ code: '1234', codeKey: 'captcha_key' });
 * // 如果验证码正确返回true，否则返回false
 */
export async function buildVerify({ code, codeKey }: VerifyParams): Promise<boolean> {
  const codeCache = await svgCache.get<CaptchaCache>(codeKey);

  if (!codeCache) {
    return false;
  }

  if (codeCache.text.toLowerCase() != code.toLowerCase()) {
    return false;
  } else {
    await svgCache.del(codeKey);
    return true;
  }
}

/**
 * 校验验证码是否正确（别名）
 * @param {VerifyParams} param 验证码参数
 * @param {string} param.code 验证码
 * @param {string} param.codeKey 验证码KEY
 * @returns {Promise<boolean>} true 为正确, false 为错误
 * @description 该函数用于校验图形验证码是否正确，验证成功后会删除缓存的验证码
 * @example
 * const isValid = await buildCommonVerify({ code: '1234', codeKey: 'captcha_key' });
 * // 如果验证码正确返回true，否则返回false
 */
export async function buildCommonVerify({ code, codeKey }: VerifyParams): Promise<boolean> {
  return buildVerify({ code, codeKey });
}
