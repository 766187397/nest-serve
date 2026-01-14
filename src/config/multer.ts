import { diskStorage, Options, FileFilterCallback } from 'multer';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface MulterConfig {
  rootPath: string;
  serveRoot: string;
  maxSize: number;
  allowedTypes: string[];
}

export const getMulterConfig = (configService: ConfigService): MulterConfig => {
  const rootPath = configService.get<string>('UPLOAD_DIR') || 'uploads';
  const maxSize = configService.get<number>('UPLOAD_MAX_SIZE') || 10 * 1024 * 1024;
  const allowedTypesStr = configService.get<string>('UPLOAD_ALLOWED_TYPES') || '';
  const allowedTypes = allowedTypesStr ? allowedTypesStr.split(',').map((type) => type.trim()) : [];

  return {
    rootPath,
    serveRoot: '/' + rootPath,
    maxSize,
    allowedTypes,
  };
};

export const getMulterOptions = (configService: ConfigService): Options => {
  const config = getMulterConfig(configService);

  return {
    storage: diskStorage({
      destination: config.rootPath,
      filename: (req, file, cb) => {
        const safeFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, `${Date.now()}-${safeFileName}`);
      },
    }),
    limits: {
      fileSize: config.maxSize,
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (config.allowedTypes.length === 0) {
        cb(null, true);
        return;
      }

      const allowed = config.allowedTypes.includes(file.mimetype);
      if (allowed) {
        cb(null, true);
      } else {
        cb(new Error(`不支持的文件类型: ${file.mimetype}`));
      }
    },
  };
};

export class FileUploadService {
  MB = 20;
  size = 1024 * 1024 * this.MB;
  rootPath = 'uploads';
  serveRoot = '/' + this.rootPath;
  multerOptions = {
    storage: diskStorage({
      destination: this.rootPath,
      filename: (req, file, cb) => {
        const safeFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, `${Date.now()}-${safeFileName}`);
      },
    }),
    limits: {
      fileSize: this.size,
    },
  };
}
