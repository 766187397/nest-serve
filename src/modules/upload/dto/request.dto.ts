import { FindByParameter, PageByParameter } from '@/common/dto/base';
import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

/** 文件上传请求DTO */
export class FileUploadDTO {
  @ApiProperty({ type: 'string', format: 'binary', required: true, description: '文件上传' })
  @IsNotEmpty({ message: '文件不能为空' })
  file: Express.Multer.File;
}

/** 查询所有文件请求DTO */
export class FindFileDto extends FindByParameter {
  @ApiProperty({ type: 'string', required: false, description: '文件名称' })
  fileName?: string;
}

/** 分页查询文件请求DTO */
export class FindFileDtoByPage extends PartialType(IntersectionType(FindFileDto, PageByParameter)) {}

/** hash值和文件大小请求DTO */
export class FileHashDTO {
  @ApiProperty({ type: 'string', required: true, description: '文件hash值' })
  @IsNotEmpty({ message: '文件hash值不能为空' })
  hash: string;

  @ApiProperty({ type: 'number', required: true, description: '文件大小' })
  @IsNotEmpty({ message: '文件大小不能为空' })
  size: number;
}
