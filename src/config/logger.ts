import * as DailyRotateFile from "winston-daily-rotate-file";
/** info 日志配置 */
export const InfoConfig = new DailyRotateFile({
  filename: "logs/%DATE%/info.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m", // 单个文件最大 20MB
  maxFiles: "30d", // 保留最近 30 天的日志
  zippedArchive: true, // 自动压缩旧日志
  level: "info", // 记录 info 及以上级别
  json: true, // 以 JSON 格式存储
});

/** error 日志配置 */
export const ErrorConfig = new DailyRotateFile({
  filename: "logs/%DATE%/error.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m", // 单个文件最大 20MB
  maxFiles: "30d", // 保留最近 30 天的日志
  zippedArchive: true, // 自动压缩旧日志
  level: "error", // 记录 error 及以上级别
  json: true, // 以 JSON 格式存储
});

/** debug 日志配置 */
export const DebugConfig = new DailyRotateFile({
  filename: "logs/%DATE%/debug.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m", // 单个文件最大 20MB
  maxFiles: "30d", // 保留最近 30 天的日志
  zippedArchive: true, // 自动压缩旧日志
  level: "debug", // 记录 debug 及以上级别
  json: true, // 以 JSON 格式存储
});

/** warn 日志配置 */
export const WarnConfig = new DailyRotateFile({
  filename: "logs/%DATE%/warn.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m", // 单个文件最大 20MB
  maxFiles: "30d", // 保留最近 30 天的日志
  zippedArchive: true, // 自动压缩旧日志
  level: "warn", // 记录 warn 及以上级别
  json: true, // 以 JSON 格式存储
});
