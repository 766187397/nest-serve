import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { NoticeService } from "./notice.service";
import { CreateNoticeDto, FindNoticeDtoByPage, UpdateNoticeDto } from "./dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";

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
    return this.noticeService.create(createNoticeDto);
  }

  @Get("page")
  @ApiOperation({ summary: "查询公告列表(分页)" })
  findByPage(@Query(new FilterEmptyPipe()) findNoticeDtoByPage: FindNoticeDtoByPage) {
    return this.noticeService.findByPage(findNoticeDtoByPage);
  }

  @Get("info/:id")
  @ApiOperation({ summary: "获取公告" })
  findOne(@Param("id") id: string) {
    return this.noticeService.findOne(+id);
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "更新公告" })
  update(@Param("id") id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticeService.update(+id, updateNoticeDto);
  }

  @Delete("delete/:id")
  @ApiOperation({ summary: "删除公告" })
  remove(@Param("id") id: string) {
    return this.noticeService.remove(+id);
  }
}
