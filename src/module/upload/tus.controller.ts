// src/tus.controller.ts
import { Controller, All, Req, Res, OnModuleInit, Query, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { Server, FileStore, EVENTS } from 'tus-node-server';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import * as path from 'path';
import * as fs from 'fs';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';
import { getMulterConfig } from '@/config/multer';
import { FileHashDTO, UploadFileDto } from './dto/index.dto';
import { ApiResult } from '@/common/utils/result';

@ApiTags('大文件切片上传')
@Controller('api/v1/large/files')
export class TusController implements OnModuleInit {
  private tusServer: Server;
  private uploadDir: string;

  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService
  ) {}

  onModuleInit() {
    const multerConfig = getMulterConfig(this.configService);
    this.uploadDir = multerConfig.rootPath;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    this.tusServer = new Server({
      path: '/api/v1/large/files',
      relativeLocation: true,
    });

    this.tusServer.datastore = new FileStore({
      directory: this.uploadDir,
    });

    this.tusServer.on(EVENTS.EVENT_UPLOAD_COMPLETE, async (event) => {
      const file = event.file as {
        id: string;
        upload_metadata: string;
        upload_length: number;
      };
      const metadata = this.parseMetadata(file.upload_metadata || '');
      const originalName = metadata.filename || 'unnamed';
      const extension = path.extname(originalName);
      const oldPath = path.join(this.uploadDir, file.id);
      const newPath = path.join(this.uploadDir, `${file.id}${extension}`);

      fs.renameSync(oldPath, newPath);
      const uploadFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: originalName,
        encoding: '7bit',
        mimetype: metadata.filetype,
        size: file.upload_length,
        destination: this.uploadDir,
        filename: `${file.id}${extension}`,
        path: newPath,
        buffer: Buffer.alloc(0),
        stream: null as any,
      };
      await this.uploadService.uploadFile(uploadFile, metadata.hash);
    });
  }

  // 用于处理除了 DELETE 之外的所有请求，将请求交给 tus-node-server 处理
  @All('*')
  @ApiOperation({ summary: '大文件切片上传，前端也得使用tus' })
  async handleTus(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.tusServer.handle(req, res);
  }

  // 解析 tus metadata，格式类似 "filename base64encodedValue,filetype base64encodedValue"
  private parseMetadata(metadata: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!metadata) return result;
    const parts = metadata.split(',');
    for (const part of parts) {
      const [key, base64Value] = part.split(' ');
      if (key && base64Value) {
        result[key] = Buffer.from(base64Value, 'base64').toString('utf-8');
      }
    }
    return result;
  }
}

@ApiTags('大文件切片上传')
@Controller('api/v1/large')
export class CustomizeTusController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('upload/second')
  @ApiOperation({
    summary: '大文件秒传',
    description: '根据文件的hash值查询是否已上传',
  })
  @ApiOkResponse({ type: UploadFileDto, description: '大文件秒传成功' })
  async getFileByHash(@Query() fileHashDTO: FileHashDTO) {
    return this.uploadService.getFileByHash(fileHashDTO);
  }
}
