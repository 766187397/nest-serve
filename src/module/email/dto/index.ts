import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateEmailDto {}
export class UpdateEmailDto {}
export class SendEmail {
  @ApiProperty({ description: "收件人邮箱", example: "766187397@qq.com" })
  @IsString({ message: "邮箱字符串" })
  @IsNotEmpty({ message: "邮箱是必填项" }) // 必填校验
  email: string;

  @ApiProperty({ description: "邮件标题", example: "测试邮件" })
  @IsString({ message: "标题字符串" })
  @IsNotEmpty({ message: "标题是必填项" })
  title: string;

  @ApiProperty({ description: "邮件内容", example: "这是测试邮件" })
  @IsString({ message: "内容字符串" })
  @IsNotEmpty({ message: "内容是必填项" })
  content: string;
}
