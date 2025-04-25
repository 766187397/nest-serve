import { Between } from "typeorm";
import { FindByParameter, FindByPage } from "@/common/dto/base";
import dayjs from "dayjs";

interface FilterQueryOptions {
  where: { [key: string]: any };
  order: { [key: string]: any };
  take?: number;
  skip?: number;
}

/**
 * 查询条件初步处理
 * @param query 查询条件 需要将DTO继承于FindByParameter或FindByPage
 * @returns {FilterQueryOptions} 初步处理后的结构
 */
export function filterQuery<T extends FindByParameter & FindByPage & { [key: string]: any }>(
  query: T
): FilterQueryOptions {
  let { page = 1, pageSize = 10, sort, ...rest } = query;
  
  let where: { [key: string]: any } = ObjectFilterAbnormal(rest); // 删除空值
  let order: { [key: string]: any } = {
    createdAt: sort || "DESC",
  };

  const take = +pageSize;
  const skip = (+page - 1) * +pageSize;
  if (!query || Object.keys(query).length === 0) {
    return { where, order, take, skip };
  }
  if (query.id) {
    where.id = +query.id;
  }
  if (query.time && query.time.length === 2) {
    let start = dayjs(query.time[0]).startOf("day").toDate();
    let end = dayjs(query.time[1]).endOf("day").toDate();
    where.createdAt = Between(start, end);
  }
  return { where, order, take, skip };
}

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
