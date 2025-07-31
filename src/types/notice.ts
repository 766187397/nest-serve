export interface NoticeWsFindUserOrRole {
  id: string;
  content?: string | undefined;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeByPageByUserOrRole extends NoticeWsFindUserOrRole {
  status: boolean; // 是否已读
}
