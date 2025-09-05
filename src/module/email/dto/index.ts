import { CreateBaseDto, FindByParameter, PageByParameter, VerificationCodeDto } from "@/common/dto/base";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

/** 创建邮箱模板 */
export class CreateEmailDto extends CreateBaseDto {
  @ApiProperty({ description: "邮件标签", example: "loginCode" })
  @IsString({ message: "类型必须是字符串" })
  @IsNotEmpty({ message: "类型是必填项" })
  type: string;

  @ApiProperty({ description: "邮件标题", example: "测试邮件" })
  @IsString({ message: "标题必须是字符串" })
  @IsNotEmpty({ message: "标题是必填项" })
  title: string;

  @ApiProperty({ description: "邮件内容；自定义变量有{code|createdAt|用户信息}", example: "这是测试邮件" })
  @IsString({ message: "内容字符串" })
  @IsNotEmpty({ message: "内容是必填项" })
  content: string;
}

/** 更新邮箱模板 */
export class UpdateEmailDto extends PartialType(CreateEmailDto) {}

/** 不分页请求模板 */
export class FindEmailDto extends FindByParameter {
  @ApiProperty({ description: "邮箱标题" })
  @IsOptional()
  @IsString({ message: "标题必须是字符串" })
  title?: string;
}

/** 分页请求模板 */
export class FindEmailtoByPage extends PartialType(IntersectionType(FindEmailDto, PageByParameter)) {}

/** 发送邮件 */
export class SendEmail extends VerificationCodeDto {
  @ApiProperty({ description: "模板标签" })
  @IsString({ message: "类型必须是字符串" })
  @IsNotEmpty({ message: "类型必须是必填项" }) // 必填校验
  type: string;

  @ApiProperty({ description: "收件人邮箱", example: "766187397@qq.com" })
  @IsString({ message: "邮箱字符串" })
  @IsNotEmpty({ message: "邮箱是必填项" }) // 必填校验
  email: string;
}
