import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { MulterConfigInterceptor } from '@/common/interceptors/multer-config.interceptor';
import { FindFileDto, FindFileDtoByPage } from './dto';
import { FilterEmptyPipe } from '@/common/pipes/filterEmptyPipe';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { Response } from 'express';
import {
  UploadResponseDto,
  UploadResponseWrapperDto,
  UploadListResponseWrapperDto,
} from './dto/response.dto';

@ApiTags('文件上传')
@Controller('api/v1/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ summary: '文件上传' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(MulterConfigInterceptor)
  @ApiBody({
    description: '文件上传',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: () => UploadResponseWrapperDto, description: '文件上传成功' })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有文件列表' })
  @ApiOkResponse({ type: () => UploadListResponseWrapperDto, description: '获取所有文件列表成功' })
  getFileAll(@Query(new FilterEmptyPipe()) FindFileDto: FindFileDto) {
    return this.uploadService.getFileAll(FindFileDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询文件' })
  @ApiOkResponse({ type: () => UploadListResponseWrapperDto, description: '分页查询文件成功' })
  getFileByPage(@Query(new FilterEmptyPipe()) findFileDtoByPage: FindFileDtoByPage) {
    return this.uploadService.getFileByPage(findFileDtoByPage);
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true, description: '文件 ID' })
  @ApiOperation({ summary: '根据id获取文件' })
  @ApiOkResponse({ type: UploadResponseDto, description: '根据id获取文件成功' })
  getFileById(@Param('id') id: string) {
    return this.uploadService.getFileById(id);
  }

  @Get('download')
  @ApiOperation({ summary: '下载文件' })
  @ApiParam({ name: 'fileUrl', required: true, description: '文件 URL' })
  @ApiOkResponse({ description: '下载文件成功，返回文件流' })
  downloadFile(@Query('fileUrl') fileUrl: string, @Res() res: Response) {
    if (!fileUrl) {
      throw new Error('缺少 url 参数');
    }

    // 简单校验协议
    let client: typeof http | typeof https;
    try {
      const u = new URL(fileUrl);
      client = u.protocol === 'https:' ? https : http;
    } catch {
      throw new Error('非法 url');
    }

    const filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'file';

    client
      .get(fileUrl, (upstream) => {
        // 透传关键头
        res.setHeader(
          'Content-Type',
          upstream.headers['content-type'] || 'application/octet-stream'
        );
        res.setHeader('Content-Length', upstream.headers['content-length'] || '');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${encodeURIComponent(filename)}"`
        );
        res.setHeader('Access-Control-Expose-Headers', `Content-Disposition`);

        // 管道转发
        upstream.pipe(res);
      })
      .on('error', () => {
        throw new Error('下载失败');
      });
  }
}
