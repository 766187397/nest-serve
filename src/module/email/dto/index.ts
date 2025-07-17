import { CreateBaseDto } from "@/common/dto/base";
import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

class EmailOptionalDto extends CreateBaseDto {
  @ApiProperty({ description: "邮件标题", example: "测试邮件" })
  @IsString({ message: "标题字符串" })
  @IsNotEmpty({ message: "标题是必填项" })
  title: string;

  @ApiProperty({ description: "邮件内容", example: "这是测试邮件" })
  @IsString({ message: "内容字符串" })
  @IsNotEmpty({ message: "内容是必填项" })
  content: string;
}

/** 创建邮箱模板 */
export class CreateEmailDto extends EmailOptionalDto {}

/** 更新邮箱模板 */
export class UpdateEmailDto extends PartialType(EmailOptionalDto) {
  @ApiProperty({ description: "邮件标题", example: "测试邮件" })
  @IsOptional()
  @IsString({ message: "标题字符串" })
  title?: string;

  @ApiProperty({ description: "邮件内容", example: "这是测试邮件" })
  @IsOptional()
  @IsString({ message: "内容字符串" })
  content?: string;
}

/** 发送邮件 */
export class SendEmail extends EmailOptionalDto {
  @ApiProperty({ description: "收件人邮箱", example: "766187397@qq.com" })
  @IsString({ message: "邮箱字符串" })
  @IsNotEmpty({ message: "邮箱是必填项" }) // 必填校验
  email: string;
}
