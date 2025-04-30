import { ExceptionFilter, Catch, HttpException, ArgumentsHost } from "@nestjs/common";
import { ApiResult } from "../utils/result";

@Catch(HttpException)
export class ClassValidatorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (status === 400 && this.isClassValidatorError(exceptionResponse)) {
      const messages = (exceptionResponse as { message: string[] }).message.join(",");
      let { __isApiResult, ...apiResult } = ApiResult.error({
        code: status,
        message: messages,
        data: null,
      });
      return response.status(status).json(apiResult);
    }

    // 其他类型的异常交给下一个过滤器或默认处理
    return response.status(status).json(exceptionResponse);
  }

  // 按照class-validator返回的格式判断的
  private isClassValidatorError(response: any): boolean {
    if (typeof response !== "object") return false;
    if (!Array.isArray(response?.message)) return false;

    if (typeof response?.message === "object" && response?.statusCode === 400) {
      return true;
    }
    return false;
  }
}
