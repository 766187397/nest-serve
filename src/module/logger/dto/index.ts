import { CreateBaseDto } from "@/common/dto/base";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class LogOptionalDto extends CreateBaseDto {
  @ApiProperty({ description: "用户账号" })
  @IsOptional()
  @IsString({ message: "account必须是字符串" })
  account?: string;

  @ApiProperty({ description: "用户昵称" })
  @IsOptional()
  @IsString({ message: "nickName必须是字符串" })
  nickName?: string;

  @ApiProperty({ description: "Url" })
  @IsOptional()
  @IsString({ message: "url必须是字符串" })
  url?: string;

  @ApiProperty({ description: "请求方式" })
  @IsOptional()
  @IsString({ message: "method必须是字符串" })
  method?: string;

  @ApiProperty({ description: "请求来源" })
  @IsOptional()
  @IsString({ message: "referer必须是字符串" })
  referer?: string;

  @ApiProperty({ description: "api平台" })
  @IsOptional()
  @IsString({ message: "apiPlatform必须是字符串" })
  apiPlatform?: string;

  @ApiProperty({ description: "平台" })
  @IsOptional()
  @IsString({ message: "platform必须是字符串" })
  platform?: string;

  @ApiProperty({ description: "浏览器" })
  @IsOptional()
  @IsString({ message: "browser必须是字符串" })
  browser?: string;

  @ApiProperty({ description: "响应时间" })
  @IsOptional()
  @IsNumber({}, { message: "responseTime必须是数字" })
  responseTime?: number;

  @ApiProperty({ description: "响应内容" })
  @IsOptional()
  @IsString({ message: "resData必须是字符串" })
  resData?: string;

  @ApiProperty({ description: "状态码" })
  @IsOptional()
  @IsString({ message: "statusCode必须是字符串" })
  statusCode?: string;

  @ApiProperty({ description: "IP地址" })
  @IsOptional()
  @IsString({ message: "IP必须是字符串" })
  IP?: string;
}
