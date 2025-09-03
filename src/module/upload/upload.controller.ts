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
} from "@nestjs/common";
import { UploadService } from "./upload.service";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileUploadService } from "@/config/multer";
import { FindFileDto, FindFileDtoByPage } from "./dto/index.dto";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";
import { ApiResult } from "@/common/utils/result";
import * as https from "https";
import * as http from "http";
import { URL } from "url";
import { Response } from "express";

@ApiTags("文件上传")
@Controller("api/v1/upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("file")
  @ApiOperation({ summary: "文件上传" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", FileUploadService.multerOptions))
  @ApiBody({
    description: "文件上传",
    type: "multipart/form-data",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
      required: ["file"],
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file);
  }

  @Get("all")
  @ApiOperation({ summary: "获取所有文件列表" })
  getFileAll(@Query(new FilterEmptyPipe()) FindFileDto: FindFileDto) {
    return this.uploadService.getFileAll(FindFileDto);
  }

  @Get("page")
  @ApiOperation({ summary: "分页查询文件" })
  getFileByPage(@Query(new FilterEmptyPipe()) findFileDtoByPage: FindFileDtoByPage) {
    return this.uploadService.getFileByPage(findFileDtoByPage);
  }

  @Get("download")
  @ApiOperation({ summary: "下载文件" })
  @ApiParam({ name: "fileUrl", required: true, description: "文件 URL" })
  downloadFile(@Query("fileUrl") fileUrl: string, @Res() res: Response) {
    if (!fileUrl) {
      return ApiResult.error("缺少 url 参数");
    }

    // 简单校验协议
    let client: typeof http | typeof https;
    try {
      const u = new URL(fileUrl);
      client = u.protocol === "https:" ? https : http;
    } catch {
      return ApiResult.error("非法 url");
    }

    const filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1) || "file";

    client
      .get(fileUrl, (upstream) => {
        // 透传关键头
        res.setHeader("Content-Type", upstream.headers["content-type"] || "application/octet-stream");
        res.setHeader("Content-Length", upstream.headers["content-length"] || "");
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
        res.setHeader("Access-Control-Expose-Headers", `Content-Disposition`);

        // 管道转发
        upstream.pipe(res);
      })
      .on("error", () => {
        return ApiResult.error("下载失败");
      });
  }

  @Get("info/:id")
  @ApiParam({ name: "id", required: true, description: "文件 ID" })
  @ApiOperation({ summary: "根据id获取文件" })
  getFileById(@Query("id") id: string) {
    return this.uploadService.getFileById(id);
  }

  @Delete("delete/:id")
  @ApiOperation({ summary: "根据id删除文件" })
  @ApiParam({ name: "id", required: true, description: "文件 ID" })
  deleteFileById(@Param("id") id: string) {
    return this.uploadService.deleteFileById(id);
  }
}
