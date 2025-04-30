import { diskStorage } from "multer";

export class FileUploadService {
  static size = 1024 * 1024 * 50; // 文件大小限制
  static rootPath = "uploads"; // 文件夹名称
  static serveRoot = "/" + this.rootPath; // 主文件访问路径
  static multerOptions = {
    storage: diskStorage({
      destination: this.rootPath, // 设置保存上传文件的目录
      filename: (req, file, cb) => {
        // 保留中文
        const safeFileName = Buffer.from(file.originalname, "latin1").toString("utf8"); // 处理非ASCII字符
        cb(null, `${Date.now()}-${safeFileName}`);
      },
    }),
    limits: {
      fileSize: this.size, // 限制文件大小为50MB
    },
  };
}
