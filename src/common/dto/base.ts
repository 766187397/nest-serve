import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, Matches } from "class-validator";
import { FindOptionsOrderValue } from "typeorm";

/**
 * 创建基础数据
 */
export class CreateBaseDto {
  @ApiProperty({ description: "排序", required: false, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: "排序必须为数字" })
  sort?: number;

  @ApiProperty({ description: "状态；1 - 启用，2 - 禁用；根据模块业务定义", required: false, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: "状态必须为数字" })
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
  @IsString({ message: "排序必须为字符串" })
  sort?: FindOptionsOrderValue;

  @ApiProperty({
    type: "string",
    description: "状态；1 - 启用，2 - 禁用；根据模块业务定义",
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsString({ message: "状态值必须为字符串" })
  status?: string;

  @ApiProperty({
    type: "string",
    description:
      "时间范围(根据创建时间查询)以逗号分隔，也兼容了数组，长度必须为2，时间需要精确到时分秒防止查询同一天为空",
    required: false,
    example: "2025-1-1 10:10:10,2025-1-2 23:59:59",
  })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsOptional()
  @Matches(
    /^(\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2})[,，至到](\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2})$/,
    {
      message: "日期范围格式错误，应为“YYYY-M-D HH:MM:SS,YYYY-M-D HH:MM:SS”或使用中文分隔符“，”、“至”、“到”",
    }
  )
  // @IsString({ message: "时间范围必须为字符串，并且需要使用逗号隔开" })
  time?: string | string[];
}

/** 验证码 */
export class VerificationCodeDto {
  @ApiProperty({
    description: "验证码",
    required: true,
  })
  @IsString({ message: "验证码必须为字符串" })
  code: string;

  @ApiProperty({
    description: "验证码对应的键",
    required: true,
  })
  @IsString({ message: "验证码对应的键必须为字符串" })
  codeKey: string;
}
