import { Between, FindOptionsOrderValue } from "typeorm";
import * as dayjs from "dayjs";

export class BaseService {
  dayjs = dayjs;
  /**
   * 通用的处理查询条件
   * @param {object} query 查询条件
   * @returns {{ [key: string]: any }} 处理后的查询条件
   */
  buildCommonQuery(query: { [key: string]: any } | undefined): { [key: string]: any } {
    if (typeof query === "undefined") {
      return {};
    }
    let where: { [key: string]: any } = {};
    if (query.status) {
      where.status = query.status;
    }
    let time: string[] = [];
    if (typeof query.time === "string") {
      time = query.time.split(/[,，、到至]+/);
    } else if (Array.isArray(query.time)) {
      time = query.time;
    }
    if (time.length == 2) {
      let start = dayjs(time[0]).startOf("day").toDate();
      let end = dayjs(time[1]).endOf("day").toDate();
      where.createdAt = Between(start, end);
    }
    return where;
  }

  /**
   * 处理默认排序 处理createdAt和id
   * @param {FindOptionsOrderValue} sort 排序条件sort DESC | ASC
   * @returns {{[key: string]: FindOptionsOrderValue}} 处理后的排序条件
   */
  buildCommonSort(sort?: FindOptionsOrderValue): { [key: string]: FindOptionsOrderValue } {
    const sortAll = ["ASC", "DESC", "asc", "desc"];

    if (typeof sort === "undefined") {
      return { sort: "DESC", createdAt: "DESC" };
    }
    if (sortAll.includes(sort as string)) {
      return { sort: sort, createdAt: sort };
    }
    return { sort: "DESC", createdAt: "DESC" };
  }

  /**
   * 统一计算分页函数
   * @param {number|string} page 页码
   * @param {number|string} pageSize 每页数量
   * @returns {Object} {take:number,skip:number}
   * @throws {Error} page和pageSize必须为正整数或字符串形式的正整数
   */
  buildCommonPaging(page: number | string = 1, pageSize: number | string = 10): { take: number; skip: number } {
    page = +page;
    pageSize = +pageSize;
    if (!Number.isInteger(page) || !Number.isInteger(pageSize)) {
      throw new Error("page和pageSize必须为正整数或字符串形式的正整数");
    }
    if (page < 1) {
      throw new Error("page不能小于1");
    }
    if (pageSize < 1) {
      throw new Error("pageSize不能小于1");
    }
    // 计算take和skip
    const take = pageSize;
    const skip = (page - 1) * pageSize;
    return { take, skip };
  }
}
