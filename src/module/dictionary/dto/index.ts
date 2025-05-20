import { CreateBaseDto, FindByParameter } from "@/common/dto/base";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

/** 创建字典分类 */
export class CreateDictionaryDto extends CreateBaseDto {
  @ApiProperty({ description: "字典分类类型" })
  @IsNotEmpty({ message: "字典分类类型是必填项" })
  @IsString({ message: "字典分类类型必须是字符串" })
  type: string;

  @ApiProperty({ description: "字典分类名称" })
  @IsNotEmpty({ message: "字典分类名称是必填项" })
  @IsString({ message: "字典分类名称必须是字符串" })
  name: string;

  @ApiProperty({ description: "字典分类描述" })
  @IsString({ message: "字典分类描述必须是字符串" })
  @IsOptional()
  description?: string;
}

/** 更新字典分类 */
export class UpdateDictionaryDto extends PartialType(CreateDictionaryDto) {}

/** 字典分类查询参数 */
export class FindDictionaryDto extends FindByParameter {
  @ApiProperty({ description: "字典分类名称" })
  @IsString({ message: "字典分类名称必须是字符串" })
  @IsOptional()
  name?: string;
}
/** 分页查询字典分类 */
export class FindDictionaryDtoByPage extends PartialType(FindDictionaryDto) {
  @ApiProperty({ name: "page", type: Number, required: false, description: "页码", default: 1 })
  @IsOptional()
  @IsString({ message: "page必须是字符串" })
  page?: string;

  @ApiProperty({ name: "pageSize", type: Number, required: false, description: "每页数量", default: 10 })
  @IsOptional()
  @IsString({ message: "pageSize必须是字符串" })
  pageSize?: string;
}

/** 创建字典项 */
export class CreateDictionaryItemDto extends CreateBaseDto {
  @ApiProperty({ description: "字典分类id" })
  @IsNotEmpty({ message: "字典分类id是必填项" })
  @IsNumber({}, { message: "字典分类id必须是数字" })
  categoryId: number;

  @ApiProperty({ description: "字典项名称" })
  @IsNotEmpty({ message: "字典项名称是必填项" })
  @IsString({ message: "字典项名称必须是字符串" })
  label: string;

  @ApiProperty({ description: "字典项值" })
  @IsNotEmpty({ message: "字典项值是必填项" })
  @IsString({ message: "字典项值必须是字符串" })
  value: string;

  @ApiProperty({ description: "字典项值描述" })
  @IsString({ message: "字典项值描述必须是字符串" })
  @IsOptional()
  description?: string;
}

/** 更新字典项 */
export class UpdateDictionaryItemDto extends PartialType(CreateDictionaryItemDto) {}
