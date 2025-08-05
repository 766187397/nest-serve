import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from "@nestjs/common";
import { EmailService } from "./email.service";
import { CreateEmailDto, FindEmailDto, FindEmailtoByPage, SendEmail, UpdateEmailDto } from "./dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";
import { Request } from "express";
import { User } from "@/module/users/entities/user.entity";

@ApiTags("邮箱管理")
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("api/v1/admin/email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("create/:platform")
  @ApiOperation({ summary: "创建邮箱模板" })
  create(@Param("platform") platform: string, @Body() createEmailDto: CreateEmailDto) {
    return this.emailService.create(createEmailDto, platform);
  }

  @Get("page/:platform")
  @ApiOperation({ summary: "查询邮箱列表(分页)" })
  findByPage(@Param("platform") platform: string, @Query(new FilterEmptyPipe()) findEmailtoByPage: FindEmailtoByPage) {
    return this.emailService.findByPage(findEmailtoByPage, platform);
  }

  @Get("all/:platform")
  @ApiOperation({ summary: "查询邮箱列表(不分页)" })
  findAll(@Param("platform") platform: string, @Query(new FilterEmptyPipe()) findEmailDto: FindEmailDto) {
    return this.emailService.findAll(findEmailDto, platform);
  }

  @Get("info/:id")
  @ApiOperation({ summary: "查询邮箱详情" })
  findOne(@Param("id") id: string) {
    return this.emailService.findOne(+id);
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "更新邮箱模板" })
  update(@Param("id") id: string, @Body() updateEmailDto: UpdateEmailDto) {
    return this.emailService.update(+id, updateEmailDto);
  }

  @Delete("delete/:id")
  @ApiOperation({ summary: "删除邮箱模板" })
  remove(@Param("id") id: string) {
    return this.emailService.remove(+id);
  }

  @Post("send/email")
  @ApiOperation({ summary: "发送邮箱（自定义变量格式：验证码为{code}）" })
  sendEmail(@Body() sendEmail: SendEmail, @Req() req: Request) {
    let userInfo = req.userInfo as User;
    return this.emailService.sendEmail(sendEmail, userInfo);
  }
}
