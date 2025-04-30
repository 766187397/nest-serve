import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { FindOptionsOrderValue } from "typeorm";

/**
 * 创建基础数据
 */
export class CreateBaseDto {
  @ApiProperty({ description: "排序", required: false, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: "sort必须为数字" })
  sort?: number;

  @ApiProperty({ description: "状态；1 - 启用，2 - 禁用；根据模块业务定义", required: false, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: "status必须为数字" })
  status?: number;
}

/**
 * 查询参数
 */
export class FindByParameter {
  @ApiProperty({
    description: "排序: ASC - 升序，DESC - 降序",
    required: false,
    enum: ["ASC", "DESC"],
    default: "DESC",
  })
  @IsOptional()
  @IsString({ message: "sort必须为字符串" })
  sort?: FindOptionsOrderValue;

  @ApiProperty({
    type: "string",
    description: "状态；1 - 启用，2 - 禁用；根据模块业务定义",
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsString({ message: "status值必须为字符串" })
  status?: string;

  @ApiProperty({
    type: "string",
    description: "时间范围(根据创建时间查询)以逗号分隔",
    required: false,
    example: "2025-1-1 10:10:10,2025-1-2 23:59:59",
  })
  @IsOptional()
  @IsString({ message: "time必须为字符串" })
  time?: string;
}
