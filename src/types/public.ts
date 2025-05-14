/** 分页返回数据 */
export interface PageApiResult<T> {
  data: T;
  total: number;
  totalPages: number;
  page: number | string;
  pageSize: number | string;
}
