import { CreateBaseDto, FindByParameter } from "@/common/dto/base";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsDate, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

/** 创建通知 */
export class CreateNoticeDto extends CreateBaseDto {
  @ApiProperty({
    name: "platform",
    type: String,
    required: true,
    description: "指定的平台标识（如admin/web/app/mini）",
  })
  @IsNotEmpty({ message: "平台标识不能为空" })
  @IsString({ message: "平台标识必须是字符串" })
  platform: string;

  @ApiProperty({ name: "type", type: String, required: true, description: "类型" })
  @IsNotEmpty({ message: "类型不能为空" })
  @IsString({ message: "类型必须是字符串" })
  type: string;

  @ApiProperty({ name: "roleIDs", type: Array, required: false, description: "角色id" })
  @IsOptional()
  @IsArray({ message: "角色id必须是数组" })
  roleIDs?: string[];

  @ApiProperty({ name: "title", type: String, required: true, description: "标题" })
  @IsNotEmpty({ message: "标题不能为空" })
  @IsString({ message: "标题必须是字符串" })
  title: string;

  @ApiProperty({ name: "content", type: String, required: false, description: "内容" })
  @IsOptional()
  @IsString({ message: "内容必须是字符串" })
  content?: string;

  @ApiProperty({ name: "SpecifyTime", type: String, required: true, description: "指定时间" })
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

  @ApiProperty({ name: "type", type: String, required: true, description: "类型" })
  @IsOptional()
  @IsString({ message: "类型必须是字符串" })
  type?: string;

  @ApiProperty({ name: "title", type: String, required: true, description: "标题" })
  @IsOptional()
  @IsString({ message: "标题必须是字符串" })
  title?: string;

  @ApiProperty({ name: "roleIDs", type: Array, required: false, description: "角色id" })
  @IsOptional()
  @IsArray({ message: "角色id必须是数组" })
  roleIDs?: string[];
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
