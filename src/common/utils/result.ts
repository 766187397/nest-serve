import { HttpException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

interface Result<T> {
  code?: number;
  message?: string;
  data?: T | null;
  entities?: any;
}
export class ApiResult<T> {
  readonly __isApiResult = true;

  constructor(
    public code: number = 200,
    public message: string = "操作成功",
    public data: T | null = null
  ) {}

  static success<T>({ data = null, message = "操作成功", code = 200, entities }: Result<T> = {}): ApiResult<T> {
    if (entities) {
      data = plainToInstance(entities, data);
    }
    return new ApiResult<T>(code, message, data);
  }

  static error<T>(param: Error | string | Result<T> = {}): ApiResult<T> {
    let message = "操作失败",
      code = 400,
      data: T | null = null;
    if (param instanceof HttpException) {
      // 获取 HttpException 的响应内容和状态码
      const response = param.getResponse();
      // 如果是对象，直接使用其中的 message 字段，否则使用默认的 message
      const errorMessage = typeof response === "object" && response["message"] ? response["message"] : message;
      const statusCode = param.getStatus() || code; // 获取 HttpException 的状态码，默认使用传入的 code
      return new ApiResult<T>(statusCode, errorMessage, null);
    } else if (typeof param === "string") {
      // 如果是字符串类型，认为它是错误消息
      message = param;
    } else if (param instanceof Error) {
      // 处理 Error 对象类型
      message = param.message; // 使用 Error 的 message 属性
    } else {
      // 否则认为是一个包含 code, message, data 的对象
      // 处理包含 code, message, data 的对象
      if (param.code) code = param.code;
      if (param.message) message = param.message;
      if (param.data) data = param.data;
    }
    return new ApiResult<T>(code, message, data);
  }
}
