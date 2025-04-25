import { Injectable } from "@nestjs/common";
import { ApiResult } from "@/common/utils/result";

@Injectable()
export class Knife4jService {
  getSwagger() {
    return ApiResult.success<any>({ data: global.swaggerDocument });
  }
}
