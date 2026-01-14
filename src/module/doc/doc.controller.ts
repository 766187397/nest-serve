import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('文档管理')
@ApiResponse({ status: 200, description: '操作成功' })
@ApiResponse({ status: 500, description: '服务器异常，请联系管理员' })
@Controller()
export class DocController {
  @Get('json')
  @ApiOperation({ summary: '获取Swagger JSON文档' })
  @ApiResponse({ status: 200, description: '成功获取Swagger JSON文档' })
  getSwaggerJson(@Res() res: Response) {
    const document = (global as any).swaggerDocument;
    res.json(document);
  }

  @Get('download')
  @ApiOperation({ summary: '下载Swagger JSON文档' })
  @ApiResponse({ status: 200, description: '成功下载Swagger JSON文件' })
  downloadSwaggerJson(@Res() res: Response) {
    const document = (global as any).swaggerDocument;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=swagger.json');
    res.send(JSON.stringify(document, null, 2));
  }
}
