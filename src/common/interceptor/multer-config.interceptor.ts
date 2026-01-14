import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { MulterConfig, getMulterConfig } from '@/config/multer';
import * as multer from 'multer';
import { diskStorage, FileFilterCallback } from 'multer';
import { Request } from 'express';

@Injectable()
export class MulterConfigInterceptor implements NestInterceptor {
  private upload: multer.Multer;

  constructor(private readonly configService: ConfigService) {
    const config = getMulterConfig(this.configService);
    this.upload = multer({
      storage: diskStorage({
        destination: config.rootPath,
        filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
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
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse();

    return new Observable((observer) => {
      this.upload.single('file')(req, res, (err: Error | string) => {
        if (err) {
          observer.error(err);
        } else {
          observer.next(null);
          observer.complete();
        }
      });
    }).pipe(() => next.handle());
  }
}
