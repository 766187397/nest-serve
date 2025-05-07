// src/tus.controller.ts
import { Controller, All, Delete, Param, Req, Res, OnModuleInit } from "@nestjs/common";
import { Request, Response } from "express";
import { Server, FileStore, EVENTS } from "tus-node-server";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import * as path from "path";
import * as fs from "fs";
import { ApiResult } from "@/common/utils/result";
import { UploadService } from "./upload.service";
import { FileUploadService } from "@/config/multer";

const uploadDir = FileUploadService.rootPath;

@ApiTags("大文件切片上传")
@Controller("api/v1/large/files")
export class TusController implements OnModuleInit {
  constructor(private readonly uploadService: UploadService) {}

  private tusServer: Server;
  private uploadDir: string;

  onModuleInit() {
    // 设置上传存储目录为项目根目录下的 uploads 文件夹
    // 假设项目结构：project-root/src/... ；uploads 文件夹在 project-root/uploads
    // this.uploadDir = path.join(__dirname, "..", "..", "uploads");
    this.uploadDir = uploadDir;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // 创建 tus server 实例并传入配置项
    this.tusServer = new Server({
      path: "/api/v1/large/files", // 必须和前端的 endpoint 保持一致
      relativeLocation: true, // 表示将 FileStore 的 path 作为相对路径
    });

    // 配置 FileStore，指定文件存储目录
    this.tusServer.datastore = new FileStore({
      directory: this.uploadDir,
    });

    // 监听上传完成事件，并基于 metadata 重命名文件（添加原始扩展名）
    this.tusServer.on(EVENTS.EVENT_UPLOAD_COMPLETE, async (event) => {
      const metadata = this.parseMetadata(event.file.upload_metadata || "");
      const originalName = metadata.filename || "unnamed";
      const extension = path.extname(originalName); // 获取原始文件的扩展名
      const oldPath = path.join(this.uploadDir, event.file.id);
      const newPath = path.join(this.uploadDir, `${event.file.id}${extension}`);

      fs.renameSync(oldPath, newPath);
      let file = {
        path: newPath,
        filename: `${event.file.id}${extension}`,
        size: event.file.upload_length,
      };

      await this.uploadService.uploadFile(file);
    });
  }

  // 用于处理除了 DELETE 之外的所有请求，将请求交给 tus-node-server 处理
  @All("*")
  @ApiOperation({ summary: "大文件切片上传，前端也得使用tus" })
  async handleTus(@Req() req: Request, @Res() res: Response) {
    this.tusServer.handle(req, res);
  }

  // 解析 tus metadata，格式类似 "filename base64encodedValue,filetype base64encodedValue"
  private parseMetadata(metadata: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!metadata) return result;
    const parts = metadata.split(",");
    for (const part of parts) {
      const [key, base64Value] = part.split(" ");
      if (key && base64Value) {
        result[key] = Buffer.from(base64Value, "base64").toString("utf-8");
      }
    }
    return result;
  }
}

@ApiTags("大文件切片上传")
@Controller("api/large")
export class CustomizeTusController {
  // 取消上传接口：客户端可以发送 DELETE 请求到 /api/large/files/{upload-id}
  @Delete("tempFile/:id")
  @ApiParam({ name: "id", description: "上传文件的唯一标识符" })
  @ApiOperation({ summary: "大文件切片取消的方法" })
  cancelUpload(@Param("id") id: string) {
    const filePath = path.join(uploadDir, id);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return ApiResult.success({
          data: null,
          message: "取消上传成功。",
        });
      } catch (err) {
        console.error("取消上传失败：", err);
        return ApiResult.error("取消上传时发生错误。");
      }
    } else {
      return ApiResult.error("文件未找到。");
    }
  }
}
