import { FindByParameter } from "@/common/dto/base";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

/** 分页查询 */
export class FindLogDtoByPage extends FindByParameter {
  @ApiProperty({ name: "page", type: Number, required: false, description: "页码", default: 1 })
  @IsOptional()
  @IsString({ message: "page必须是字符串" })
  page?: string;

  @ApiProperty({ name: "pageSize", type: Number, required: false, description: "每页数量", default: 10 })
  @IsOptional()
  @IsString({ message: "pageSize必须是字符串" })
  pageSize?: string;
}
