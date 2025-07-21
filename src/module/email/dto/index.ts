import { CreateBaseDto, FindByParameter } from "@/common/dto/base";
// import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

class EmailOptionalDto extends CreateBaseDto {
  @ApiProperty({ description: "邮件标题", example: "测试邮件" })
  @IsString({ message: "标题字符串" })
  @IsNotEmpty({ message: "标题是必填项" })
  title: string;

  @ApiProperty({ description: "邮件内容；自定义变量有{code|createdAt|用户信息}", example: "这是测试邮件" })
  @IsString({ message: "内容字符串" })
  @IsNotEmpty({ message: "内容是必填项" })
  content: string;
}

/** 创建邮箱模板 */
export class CreateEmailDto extends EmailOptionalDto {}

/** 更新邮箱模板 */
export class UpdateEmailDto extends PartialType(EmailOptionalDto) {}

/** 不分页请求模板 */
export class FindEmailDto extends FindByParameter {
  @ApiProperty({ description: "邮箱标题" })
  @IsOptional()
  @IsString({ message: "标题必须是字符串" })
  title?: string;
}

/** 分页请求模板 */
export class FindEmailtoByPage extends FindEmailDto {
  @ApiProperty({ name: "page", type: Number, required: false, description: "页码", default: 1 })
  @IsOptional()
  @IsString({ message: "page必须是字符串" })
  page?: string;

  @ApiProperty({ name: "pageSize", type: Number, required: false, description: "每页数量", default: 10 })
  @IsOptional()
  @IsString({ message: "pageSize必须是字符串" })
  pageSize?: string;
}

/** 发送邮件 */
export class SendEmail {
  @ApiProperty({ description: "模板ID" })
  @IsNumber({}, { message: "模板ID必须是数字" })
  @IsNotEmpty({ message: "邮箱是必填项" }) // 必填校验
  id: number;

  @ApiProperty({ description: "收件人邮箱", example: "766187397@qq.com" })
  @IsString({ message: "邮箱字符串" })
  @IsNotEmpty({ message: "邮箱是必填项" }) // 必填校验
  email: string;
}
