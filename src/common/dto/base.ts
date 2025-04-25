import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { IsStringOrNumber } from "@/common/utils/class-validator";

/**
 * 创建基础数据
 */
export class CreateBaseDto {
  @ApiProperty({ description: "排序", required: false, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: "排序值必须为数字" })
  sort?: number;

  @ApiProperty({ description: "状态；1 - 启用，2 - 禁用；根据模块业务定义", required: false, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: "状态值必须为数字" })
  status?: number;
}

/**
 * 查询参数
 */
export class FindByParameter {
  @ApiProperty({ description: "id", required: false, example: 1 })
  @IsOptional()
  @IsStringOrNumber()
  id?: number | string;

  @ApiProperty({
    description: "排序: ASC - 升序，DESC - 降序",
    required: false,
    enum: ["ASC", "DESC"],
    default: "DESC",
  })
  @IsOptional()
  @IsString({ message: "排序值必须为字符串" })
  sort?: string;

  @ApiProperty({ description: "状态；1 - 启用，2 - 禁用；根据模块业务定义", required: false, example: 1 })
  @IsStringOrNumber()
  status?: number | string;

  @ApiProperty({ description: "时间范围(根据创建时间查询)", required: false, example: "2020-01-01" })
  @IsOptional()
  @IsArray({ message: "时间范围必须为数组" })
  time?: Date[] | string[];
}

/**
 * 分页查询
 */
export class FindByPage extends FindByParameter {
  @ApiProperty({ description: "页码", required: false, example: 1, default: 1 })
  @IsOptional()
  @IsStringOrNumber()
  page?: number | string;

  @ApiProperty({ description: "每页条数", required: false, example: 10, default: 10 })
  @IsOptional()
  @IsStringOrNumber()
  pageSize?: number | string;
}
