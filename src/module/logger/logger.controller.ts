import { Controller, Get, Post, Body, Patch, Param, Delete, Res, StreamableFile, Header } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";

@ApiTags("admin - 日志")
@ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("api/v1/admin/logger")
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}
  @Get("all")
  @ApiOperation({ summary: "查询日志文件夹列表(不分页)" })
  findAll() {
    return this.loggerService.findAll();
  }

  @Get("getFilesByDate/:date")
  @ApiOperation({ summary: "查询日志文件列表" })
  getFilesByDate(@Param("date") date: string) {
    return this.loggerService.getFilesByDate(date);
  }

  // 下载指定日期的指定文件
  @Get("downloadFile/:date/:filename")
  @ApiOperation({ summary: "下载日志文件" })
  @Header("Content-Type", "application/octet-stream")
  @Header("Content-Disposition", 'attachment; filename=":filename"')
  async downloadFile(
    @Param("date") date: string,
    @Param("filename") filename: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    let file = await this.loggerService.downloadFile(date, filename);
    // 动态设置下载文件名
    res.set({
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    });
    return new StreamableFile(file);
  }

  @Get("read/:date/:filename")
  @ApiOperation({ summary: "读取日志文件" })
  async readLoggerFile(@Param("date") date: string, @Param("filename") filename: string) {
    return this.loggerService.readLoggerFile(date, filename);
  }
}
