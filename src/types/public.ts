/** 分页返回数据 */
export interface PageApiResult<T> {
  /** 数据 */
  data: T;
  /** 总数 */
  total: number;
  /** 总页数 */
  totalPages: number;
  /** 当前页码 */
  page: number | string;
  /** 每页条数 */
  pageSize: number | string;
}
