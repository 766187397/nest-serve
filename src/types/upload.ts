export interface UploadFile {
  completePath: string;
  url: string;
  fileName: any;
  size: any;
  id: number;
  sort: number;
  status: number;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
