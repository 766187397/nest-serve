export interface UploadFile {
  completePath: string;
  url?: string;
  fileName: string;
  size: number;
  id: string;
  sort: number;
  status: number;
  platform?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date;
}
