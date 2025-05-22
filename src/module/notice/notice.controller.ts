import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from "@nestjs/common";
import { NoticeService } from "./notice.service";
import { CreateNoticeDto, FindNoticeDtoByPage, FindNoticeDtoByPageByUserOrRole, UpdateNoticeDto } from "./dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";
import { Request } from "express";
import { User } from "../users/entities/user.entity";

@ApiTags("公告")
// @ApiBearerAuth("Authorization")
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
  @ApiOperation({ summary: "查询公告列表(分页,后端编辑使用查询所有)" })
  findByPage(@Query(new FilterEmptyPipe()) findNoticeDtoByPage: FindNoticeDtoByPage) {
    return this.noticeService.findByPage(findNoticeDtoByPage);
  }

  @Get("page/userOrRole")
  @ApiOperation({ summary: "查询公告列表(分页,后台查询当前用户和角色权限对应的公告)" })
  findByPageByUserOrRole(
    @Query(new FilterEmptyPipe()) findNoticeDtoByPage: FindNoticeDtoByPageByUserOrRole,
    @Req() req: Request
  ) {
    const userInfo = req.userInfo as User;
    const roleKeys = userInfo?.roles.map((item) => item.roleKey);
    console.log("roleKeys", roleKeys);
    return this.noticeService.findByPageByUserAndRole(findNoticeDtoByPage, "admin", roleKeys, userInfo.id);
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
