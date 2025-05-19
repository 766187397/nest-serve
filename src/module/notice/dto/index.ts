import { CreateBaseDto, FindByParameter } from "@/common/dto/base";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

/** 创建通知 */
export class CreateNoticeDto extends CreateBaseDto {
  @ApiProperty({
    name: "platform",
    type: String,
    required: true,
    description: "指定的平台标识（如admin/web/app/mini）",
    example: "admin",
  })
  @IsNotEmpty({ message: "平台标识不能为空" })
  @IsString({ message: "平台标识必须是字符串" })
  platform: string;

  @ApiProperty({ name: "type", type: String, required: true, description: "类型", example: "notice" })
  @IsNotEmpty({ message: "类型不能为空" })
  @IsString({ message: "类型必须是字符串" })
  type: string;

  @ApiProperty({ name: "roleKey", type: String, required: false, description: "角色权限" })
  @IsOptional()
  @IsString({ message: "角色权限必须是字符串" })
  roleKey?: string;

  @ApiProperty({ name: "userIds", type: String, required: false, description: "用户ids（逗号隔开）" })
  @IsOptional()
  @IsString({ message: "用户ids必须是字符串" })
  userIds?: string;

  @ApiProperty({ name: "title", type: String, required: true, description: "标题", example: "通知" })
  @IsNotEmpty({ message: "标题不能为空" })
  @IsString({ message: "标题必须是字符串" })
  title: string;

  @ApiProperty({ name: "content", type: String, required: false, description: "内容" })
  @IsOptional()
  @IsString({ message: "内容必须是字符串" })
  content?: string;

  @ApiProperty({ name: "specifyTime", type: String, required: true, description: "指定时间" })
  @IsOptional()
  @IsDateString({}, { message: "指定时间必须是日期字符串" })
  specifyTime?: Date;
}

/** 修改通知 */
export class UpdateNoticeDto extends PartialType(CreateNoticeDto) {
  @ApiProperty({
    name: "platform",
    type: String,
    required: true,
    description: "指定的平台标识（如admin/web/app/mini）",
  })
  @IsOptional()
  @IsString({ message: "平台标识必须是字符串" })
  platform?: string;

  @ApiProperty({ name: "type", type: String, description: "类型" })
  @IsOptional()
  @IsString({ message: "类型必须是字符串" })
  type?: string;

  @ApiProperty({ name: "title", type: String, description: "标题" })
  @IsOptional()
  @IsString({ message: "标题必须是字符串" })
  title?: string;

  @ApiProperty({ name: "roleKey", type: String, description: "角色权限（逗号隔开）" })
  @IsOptional()
  @IsString({ message: "角色权限必须是字符串" })
  roleKey?: string;

  @ApiProperty({ name: "userIds", type: String, required: false, description: "用户ids（逗号隔开）" })
  @IsOptional()
  @IsString({ message: "用户ids必须是字符串" })
  userIds?: string;
}

/** 查询通知 */
export class FindNoticeDto extends FindByParameter {
  @ApiProperty({ name: "type", type: String, required: true, description: "类型" })
  @IsOptional()
  @IsString({ message: "类型必须是字符串" })
  type?: string;

  @ApiProperty({ name: "title", type: String, required: true, description: "标题" })
  @IsOptional()
  @IsString({ message: "标题必须是字符串" })
  title?: string;
}

/** 分页查询通知 */
export class FindNoticeDtoByPage extends FindNoticeDto {
  @ApiProperty({ name: "page", type: Number, required: false, description: "页码", default: 1 })
  @IsOptional()
  @IsString({ message: "page必须是字符串" })
  page?: string;

  @ApiProperty({ name: "pageSize", type: Number, required: false, description: "每页数量", default: 10 })
  @IsOptional()
  @IsString({ message: "pageSize必须是字符串" })
  pageSize?: string;
}
