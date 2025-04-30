import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { ApiResult } from "@/common/utils/result";

@Catch(HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const responseMessage: string | { message?: any } = exception.getResponse();

    // 如果是 Multer 产生的文件大小限制错误
    if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
      const { __isApiResult, ...data } = ApiResult.error({
        message: "上传的文件超出了允许的大小限制！最大文件限制为 50MB",
        code: status,
      });
      response.status(status).json(data);
    } else {
      let msg = responseMessage instanceof Object ? responseMessage.message : responseMessage;
      response.status(status).json(
        ApiResult.error({
          message: msg,
          code: status,
        })
      );
    }
  }
}
