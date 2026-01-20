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
import { NoticeService } from './notice.service';
import {
  CreateNoticeDto,
  FindNoticeDtoByPage,
  FindNoticeDtoByPageByUserOrRole,
  UpdateNoticeDto,
} from './dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { FilterEmptyPipe } from '@/common/pipeTransform/filterEmptyPipe';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { NoticeWS } from './notice.ws';
import { HttpStatusCodes, BusinessStatusCodes } from '@/common/constants/http-status';
import { Notice } from './entities/notice.entity';
import { ApiResult } from '@/common/utils/result';

@ApiTags('公告')
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: '操作成功' })
@ApiResponse({ status: 201, description: '操作成功，无返回内容' })
@ApiResponse({ status: 400, description: '参数错误' })
@ApiResponse({ status: 401, description: 'token失效，请重新登录' })
@ApiResponse({ status: 403, description: '权限不足' })
@ApiResponse({ status: 404, description: '请求资源不存在' })
@ApiResponse({ status: 500, description: '服务器异常，请联系管理员' })
@Controller('/api/v1/notice')
export class NoticeController {
  constructor(
    private readonly noticeService: NoticeService,
    private readonly noticeWS: NoticeWS
  ) {}

  @Post()
  @ApiOperation({ summary: '创建公告' })
  @ApiOkResponse({ type: ApiResult<Notice>, description: '创建公告成功' })
  async create(@Headers('x-platform') platform: string, @Body() createNoticeDto: CreateNoticeDto) {
    const { __isApiResult, ...data } = await this.noticeService.create(createNoticeDto, platform);
    if (data.code === BusinessStatusCodes.SUCCESS && data.data?.status === 2) {
      // 广播新公告给所有连接的客户端
      this.noticeWS.broadcastAlert(`有新公告`);
    }
    return data;
  }

  @Get()
  @ApiOperation({ summary: '查询公告列表(分页,后端编辑使用查询所有)' })
  @ApiOkResponse({ type: ApiResult<Notice[]>, description: '查询公告列表成功' })
  findByPage(
    @Headers('x-platform') platform: string,
    @Query(new FilterEmptyPipe()) findNoticeDtoByPage: FindNoticeDtoByPage
  ) {
    return this.noticeService.findByPage(findNoticeDtoByPage, platform);
  }

  @Get('page/userOrRole')
  @ApiOperation({
    summary: '查询公告列表(分页,查询当前用户和角色权限对应的公告)',
  })
  @ApiOkResponse({ type: ApiResult<Notice[]>, description: '查询公告列表成功' })
  findByPageByUserOrRole(
    @Headers('x-platform') platform: string,
    @Query(new FilterEmptyPipe())
    findNoticeDtoByPage: FindNoticeDtoByPageByUserOrRole,
    @Req() req: Request
  ) {
    const userInfo = req.userInfo as User;
    const roleKeys = userInfo?.roles.map((item) => item.roleKey);
    return this.noticeService.findByPageByUserAndRole(
      findNoticeDtoByPage,
      platform,
      roleKeys,
      userInfo.id
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取公告' })
  @ApiOkResponse({ type: ApiResult<Notice>, description: '获取公告成功' })
  findOne(@Param('id') id: string) {
    return this.noticeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新公告' })
  @ApiOkResponse({ type: ApiResult<Notice>, description: '更新公告成功' })
  async update(@Param('id') id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
    const { __isApiResult, ...data } = await this.noticeService.update(id, updateNoticeDto);
    if (data.code === BusinessStatusCodes.SUCCESS) {
      // 广播新公告给所有连接的客户端
      this.noticeWS.broadcastAlert(`有新公告`);
    }
    return data;
  }

  @Post('read/:id')
  @ApiOperation({ summary: '标记公告为已读' })
  @ApiOkResponse({ type: ApiResult<Notice>, description: '标记公告为已读成功' })
  async read(@Param('id') id: string, @Req() req: Request) {
    return this.noticeService.handleMarkByUserId(req.userInfo?.id as string, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除公告' })
  @HttpCode(HttpStatusCodes.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.noticeService.remove(id);
  }

  @Get('ws')
  @ApiOperation({
    summary: 'WebSocket 未读公告',
    description:
      '通过ws获取前三条未读的通知公告，展示用于WebSocket服务（前端使用socket.io-client这个包）',
  })
  ws() {}
}
