import { format } from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";

export const BaseFileUrl = "logs";
// info 日志过滤器
const infoOnlyFilter = format((info) => {
  return info.level === "info" ? info : false;
});

const debugOnlyFilter = format((info) => {
  return info.level === "debug" ? info : false;
});

const warnOnlyFilter = format((info) => {
  return info.level === "warn" ? info : false;
});

const errorOnlyFilter = format((info) => {
  return info.level === "error" ? info : false;
});

/** info 日志配置 */
export const InfoConfig = new DailyRotateFile({
  filename: BaseFileUrl + "/%DATE%/info.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m", // 单个文件最大 20MB
  maxFiles: "30d", // 保留最近 30 天的日志
  zippedArchive: true, // 自动压缩旧日志
  level: "info", // 记录 info 及以上级别
  json: true, // 以 JSON 格式存储
  format: format.combine(infoOnlyFilter(), format.timestamp(), format.json()),
});

/** error 日志配置 */
export const ErrorConfig = new DailyRotateFile({
  filename: BaseFileUrl + "/%DATE%/error.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m", // 单个文件最大 20MB
  maxFiles: "30d", // 保留最近 30 天的日志
  zippedArchive: true, // 自动压缩旧日志
  level: "error", // 记录 error 及以上级别
  json: true, // 以 JSON 格式存储
  format: format.combine(errorOnlyFilter(), format.timestamp(), format.json()),
});

/** debug 日志配置 */
export const DebugConfig = new DailyRotateFile({
  filename: BaseFileUrl + "/%DATE%/debug.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m", // 单个文件最大 20MB
  maxFiles: "30d", // 保留最近 30 天的日志
  zippedArchive: true, // 自动压缩旧日志
  level: "debug", // 记录 debug 及以上级别
  json: true, // 以 JSON 格式存储
  format: format.combine(debugOnlyFilter(), format.timestamp(), format.json()),
});

/** warn 日志配置 */
export const WarnConfig = new DailyRotateFile({
  filename: BaseFileUrl + "/%DATE%/warn.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m", // 单个文件最大 20MB
  maxFiles: "30d", // 保留最近 30 天的日志
  zippedArchive: true, // 自动压缩旧日志
  level: "warn", // 记录 warn 及以上级别
  json: true, // 以 JSON 格式存储
  format: format.combine(warnOnlyFilter(), format.timestamp(), format.json()),
});
