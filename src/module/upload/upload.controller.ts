import { Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileUploadService } from "@/config/multer";
import { FindFileDto, FindFileDtoByPage } from "./dto/index.dto";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";

@ApiTags("文件上传")
@Controller("api/v1/upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("file")
  @ApiOperation({ summary: "文件上传" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", FileUploadService.multerOptions))
  @ApiBody({
    description: "文件上传",
    type: "multipart/form-data",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
      required: ["file"],
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file);
  }

  @Get("all")
  @ApiOperation({ summary: "获取所有文件列表" })
  getFileAll(@Query(new FilterEmptyPipe()) FindFileDto: FindFileDto) {
    return this.uploadService.getFileAll(FindFileDto);
  }

  @Get("page")
  @ApiOperation({ summary: "分页查询文件" })
  getFileByPage(@Query(new FilterEmptyPipe()) findFileDtoByPage: FindFileDtoByPage) {
    return this.uploadService.getFileByPage(findFileDtoByPage);
  }

  @Get(":id")
  @ApiParam({ name: "id", required: true, description: "文件 ID" })
  @ApiOperation({ summary: "根据id获取文件" })
  getFileById(@Query("id") id: number) {
    return this.uploadService.getFileById(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "根据id删除文件" })
  @ApiParam({ name: "id", required: true, description: "文件 ID" })
  deleteFileById(@Param("id") id: number) {
    return this.uploadService.deleteFileById(id);
  }
}
