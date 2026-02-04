import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto, FindEmailDto, FindEmailtoByPage, SendEmail, UpdateEmailDto } from './dto';
import { ApiOperation, ApiResponse, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { FilterEmptyPipe } from '@/common/pipeTransform/filterEmptyPipe';
import { Request } from 'express';
import { User } from '@/modules/users/entities/user.entity';
import { HttpStatusCodes } from '@/common/constants/http-status';
import { EmailResponseDto, EmailResponseWrapperDto, EmailListResponseWrapperDto } from './dto/response.dto';

@ApiTags('邮箱管理')
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: '操作成功' })
@ApiResponse({ status: 201, description: '操作成功，无返回内容' })
@ApiResponse({ status: 400, description: '参数错误' })
@ApiResponse({ status: 401, description: 'token失效，请重新登录' })
@ApiResponse({ status: 403, description: '权限不足' })
@ApiResponse({ status: 404, description: '请求资源不存在' })
@ApiResponse({ status: 500, description: '服务器异常，请联系管理员' })
@Controller('api/v1/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @ApiOperation({ summary: '创建邮箱模板' })
  @ApiOkResponse({ type: () => EmailResponseWrapperDto, description: '创建邮箱模板成功' })
  create(@Headers('x-platform') platform: string, @Body() createEmailDto: CreateEmailDto) {
    return this.emailService.create(createEmailDto, platform);
  }

  @Get()
  @ApiOperation({ summary: '查询邮箱列表(分页)' })
  @ApiOkResponse({ type: () => EmailListResponseWrapperDto, description: '查询邮箱列表成功' })
  findByPage(
    @Headers('x-platform') platform: string,
    @Query(new FilterEmptyPipe()) findEmailtoByPage: FindEmailtoByPage
  ) {
    return this.emailService.findByPage(findEmailtoByPage, platform);
  }

  @Get('all')
  @ApiOperation({ summary: '查询邮箱列表(不分页)' })
  @ApiOkResponse({ type: () => EmailListResponseWrapperDto, description: '查询邮箱列表成功' })
  findAll(
    @Headers('x-platform') platform: string,
    @Query(new FilterEmptyPipe()) findEmailDto: FindEmailDto
  ) {
    return this.emailService.findAll(findEmailDto, platform);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询邮箱详情' })
  @ApiOkResponse({ type: () => EmailResponseWrapperDto, description: '查询邮箱详情成功' })
  findOne(@Param('id') id: string) {
    return this.emailService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新邮箱模板' })
  @ApiOkResponse({ type: () => EmailResponseWrapperDto, description: '更新邮箱模板成功' })
  update(@Param('id') id: string, @Body() updateEmailDto: UpdateEmailDto) {
    return this.emailService.update(+id, updateEmailDto);
  }

  @Post('send')
  @ApiOperation({ summary: '发送邮箱（自定义变量格式：验证码为{code}）' })
  @ApiOkResponse({ type: Object, description: '发送邮箱成功' })
  sendEmail(@Body() sendEmail: SendEmail, @Req() req: Request) {
    const userInfo = req.userInfo as User;
    return this.emailService.sendEmail(sendEmail, userInfo);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除邮箱模板' })
  @HttpCode(HttpStatusCodes.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.emailService.remove(+id);
  }
}
