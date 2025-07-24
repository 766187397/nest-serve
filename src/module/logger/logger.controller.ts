import { Controller, Get, Post, Body, Patch, Param, Delete, Res, StreamableFile, Header, Query } from "@nestjs/common";
import { LoggerService } from "./logger.service";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";
import { FindLogDtoByPage } from "./dto";

@ApiTags("admin - 日志")
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("api/v1/admin/logger")
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}
  @Get("page/:platform")
  @ApiOperation({ summary: "查询日志列表(分页)" })
  findByPage(@Param("platform") platform: string, @Query(new FilterEmptyPipe()) findLogDtoByPage: FindLogDtoByPage) {
    return this.loggerService.findByPage(findLogDtoByPage, platform);
  }
}
