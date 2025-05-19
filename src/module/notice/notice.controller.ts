import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { NoticeService } from "./notice.service";
import { CreateNoticeDto, UpdateNoticeDto } from "./dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("公告")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("/api/v1/admin/notice")
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post("create")
  @ApiOperation({ summary: "创建公告" })
  create(@Body() createNoticeDto: CreateNoticeDto) {
    console.log('createNoticeDto', createNoticeDto)
    return this.noticeService.create(createNoticeDto);
  }

  @Get()
  findAll() {
    return this.noticeService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.noticeService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticeService.update(+id, updateNoticeDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.noticeService.remove(+id);
  }
}
