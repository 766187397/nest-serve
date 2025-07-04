import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { ChataiService } from "./chatai.service";
import { ChatRequestDto } from "./dto/index";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("AI")
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("/api/v1/admin/chatai")
export class ChataiController {
  constructor(private readonly chataiService: ChataiService) {}

  @Post("chat")
  @ApiOperation({ summary: "AI 对话" })
  chat(@Body() message: ChatRequestDto) {
    return this.chataiService.chat(message);
  }

  @Post("create/images")
  @ApiOperation({ summary: "AI 生图" })
  createImages(@Body() message: ChatRequestDto) {
    return this.chataiService.chat(message);
  }
}
