export interface NoticeWsFindUserOrRole {
  id: string;
  content?: string | undefined;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: number; // 1 - 暂存，2 - 发布
}

export interface NoticeByPageByUserOrRole extends NoticeWsFindUserOrRole {
  readStatus: boolean; // 是否已读
}

/** 分页返回数据 */
export interface NoticePageApiResult<T> {
  /** 已读状态 */
  unread: boolean;
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
