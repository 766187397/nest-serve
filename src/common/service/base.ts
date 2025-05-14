import * as dayjs from "dayjs";
import { Between, FindOptionsOrderValue } from "typeorm";

export class BaseService {
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
      time = query.time.split(",");
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
   * @param {{ [key: string]: any }} sort DESC | ASC
   * @returns {{[key: string]: FindOptionsOrderValue}} 处理后的排序条件
   */
  buildCommonSort(sort: { [key: string]: any } | undefined): {
    [key: string]: FindOptionsOrderValue;
  } {
    if (!sort || typeof sort === "undefined") {
      return { createdAt: "DESC", id: "DESC" };
    }

    return {
      createdAt: "DESC",
      id: "DESC",
    };
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
