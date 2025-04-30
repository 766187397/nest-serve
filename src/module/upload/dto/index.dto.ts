import { FindByParameter } from "@/common/dto/base";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

/**
 * 文件上传
 */
export class FileUploadDTO {
  @ApiProperty({ type: "string", format: "binary", required: true, description: "文件上传" })
  @IsNotEmpty({ message: "文件不能为空" })
  file: any;
}
/**
 * 查询所有文件
 */
export class FindFileDto extends FindByParameter {
  @ApiProperty({ type: "string", required: false, description: "文件名称" })
  fileName?: string;
}
/**
 * 分页查询文件
 */
export class FindFileDtoByPage extends FindFileDto {
  @ApiProperty({ name: "page", type: Number, required: false, description: "页码", default: 1 })
  @IsOptional()
  @IsString({ message: "page必须是字符串" })
  page?: string;

  @ApiProperty({ name: "pageSize", type: Number, required: false, description: "每页数量", default: 10 })
  @IsOptional()
  @IsString({ message: "pageSize必须是字符串" })
  pageSize?: string;
}
