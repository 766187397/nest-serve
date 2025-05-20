import { CreateBaseDto, FindByParameter } from "@/common/dto/base";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

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
