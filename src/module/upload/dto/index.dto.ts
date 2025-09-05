import { FindByParameter, PageByParameter } from "@/common/dto/base";
import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

/** 文件上传  */
export class FileUploadDTO {
  @ApiProperty({ type: "string", format: "binary", required: true, description: "文件上传" })
  @IsNotEmpty({ message: "文件不能为空" })
  file: any;
}
/** 查询所有文件 */
export class FindFileDto extends FindByParameter {
  @ApiProperty({ type: "string", required: false, description: "文件名称" })
  fileName?: string;
}
/** 分页查询文件 */
export class FindFileDtoByPage extends PartialType(IntersectionType(FindFileDto, PageByParameter)) {}

/** hash值和文件大小 */
export class FileHashDTO {
  @ApiProperty({ type: "string", required: true, description: "文件hash值" })
  @IsNotEmpty({ message: "文件hash值不能为空" })
  hash: string;

  @ApiProperty({ type: "string", required: true, description: "文件大小" })
  @IsNotEmpty({ message: "文件大小不能为空" })
  size: string;
}
