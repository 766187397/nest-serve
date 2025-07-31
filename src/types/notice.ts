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
