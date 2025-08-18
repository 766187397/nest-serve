import { CreateBaseDto, FindByParameter, PageByParameter } from "@/common/dto/base";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

/** 创建通知 */
export class CreateNoticeDto extends CreateBaseDto {
  @ApiProperty({ name: "title", type: String, required: true, description: "标题", example: "通知" })
  @IsNotEmpty({ message: "标题不能为空" })
  @IsString({ message: "标题必须是字符串" })
  title: string;

  @ApiProperty({ description: "状态；1 - 暂存，2 - 发布", required: false, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: "状态必须为数字" })
  declare status?: number;

  @ApiProperty({ name: "roleKeys", type: String, required: false, description: "角色权限" })
  @IsOptional()
  @IsString({ message: "角色权限必须是字符串" })
  roleKeys?: string;

  @ApiProperty({ name: "userIds", type: String, required: false, description: "用户ids（逗号隔开）" })
  @IsOptional()
  @IsString({ message: "用户ids必须是字符串" })
  userIds?: string;

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
export class UpdateNoticeDto extends PartialType(CreateNoticeDto) {}

/** 查询通知 */
export class FindNoticeDto extends FindByParameter {
  @ApiProperty({ name: "title", type: String, required: false, description: "标题" })
  @IsOptional()
  @IsString({ message: "标题必须是字符串" })
  title?: string;

  @ApiProperty({
    name: "platform",
    type: String,
    required: false,
    description: "指定的平台标识（如admin/web/app/mini）",
  })
  @IsOptional()
  @IsString({ message: "平台标识必须是字符串" })
  platform?: string;
}

/** 分页查询通知 */
export class FindNoticeDtoByPage extends PartialType(IntersectionType(FindNoticeDto, PageByParameter)) {}

/** 分页查询通知 通过用户或角色 */
export class FindNoticeDtoByPageByUserOrRole extends PageByParameter {}
