import { FindByParameter, PageByParameter } from '@/common/dto/base';
import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

 /** 文件上传响应DTO */
 export class UploadFileDto {
   @ApiProperty({ description: '完整路径', example: '/uploads/file.txt' })
   completePath: string;

   @ApiProperty({ description: '文件URL', required: false, example: 'http://localhost:3000/uploads/file.txt' })
   url?: string;

   @ApiProperty({ description: '文件名', example: 'file.txt' })
   fileName: string;

   @ApiProperty({ description: '文件大小', example: 1024 })
   size: number;

   @ApiProperty({ description: '文件ID', example: '1' })
   id: string;

   @ApiProperty({ description: '排序', example: 1 })
   sort: number;

   @ApiProperty({ description: '状态', example: 1 })
   status: number;

   @ApiProperty({ description: '平台', required: false, example: 'web' })
   platform?: string;

   @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
   createdAt: Date | string;

   @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
   updatedAt: Date | string;

   @ApiProperty({ description: '删除时间', required: false, example: '2024-01-01T00:00:00.000Z' })
   deletedAt?: Date;
 }
 
 /** 文件上传  */
 export class FileUploadDTO {
   @ApiProperty({
     type: 'string',
     format: 'binary',
     required: true,
     description: '文件上传',
   })
   @IsNotEmpty({ message: '文件不能为空' })
   file: Express.Multer.File;
 }
/** 查询所有文件 */
export class FindFileDto extends FindByParameter {
  @ApiProperty({ type: 'string', required: false, description: '文件名称' })
  fileName?: string;
}
/** 分页查询文件 */
export class FindFileDtoByPage extends PartialType(
  IntersectionType(FindFileDto, PageByParameter)
) {}

/** hash值和文件大小 */
export class FileHashDTO {
  @ApiProperty({ type: 'string', required: true, description: '文件hash值' })
  @IsNotEmpty({ message: '文件hash值不能为空' })
  hash: string;

  @ApiProperty({ type: 'number', required: true, description: '文件大小' })
  @IsNotEmpty({ message: '文件大小不能为空' })
  size: number;
}
