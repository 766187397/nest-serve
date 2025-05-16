import { ApiResult } from "@/common/utils/result";
import { BaseFileUrl } from "@/config/logger";
import { Inject, Injectable } from "@nestjs/common";
import { createReadStream } from "fs";
import { readFile } from "fs/promises";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { join } from "path";
import { Logger } from "winston";
import { promises as fsPromises } from "fs";

@Injectable()
export class LoggerService {
  logRootDir = BaseFileUrl; // 日志根目录路径
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  info(message: string, options?: any) {
    this.logger.info(message, options);
  }
  error(message: string, options?: any) {
    this.logger.error(message, options);
  }
  warn(message: string, options?: any) {
    this.logger.warn(message, options);
  }
  debug(message: string, options?: any) {
    this.logger.debug(message, options);
  }

  async findAll() {
    try {
      const allItems = await fsPromises.readdir(this.logRootDir, { withFileTypes: true });
      // 过滤出符合 YYYY-MM-DD 格式的文件夹
      const dateFolders = allItems
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // 按日期倒序

      return ApiResult.success({ data: dateFolders });
    } catch (error) {
      return ApiResult.error(error || "获取日志列表失败，请稍后再试");
    }
  }

  async getFilesByDate(date: string) {
    try {
      const logDir = join(process.cwd(), this.logRootDir, date);
      const data = await fsPromises.readdir(logDir);
      return ApiResult.success({ data });
    } catch (error) {
      return ApiResult.error(error || "获取日志列表失败，请稍后再试");
    }
  }

  async downloadFile(date: string, fileName: string) {
    const filePath = join(process.cwd(), this.logRootDir, date, fileName);
    return createReadStream(filePath);
  }

  async readLoggerFile(date: string, fileName: string) {
    try {
      const filePath = join(process.cwd(), this.logRootDir, date, fileName);
      // 异步读取
      let file = await readFile(filePath, "utf-8");
      return ApiResult.success({ data: file });
    } catch (error) {
      return ApiResult.error(error || "获取日志文件失败，请稍后再试");
    }
  }
}
