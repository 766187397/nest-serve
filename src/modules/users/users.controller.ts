import { Controller, Get, Post, Body, Param, Query, Res, Headers, Header } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, FindUserDto, FindUserDtoByPage } from './dto/index';
import { ApiOperation, ApiResponse, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { FilterEmptyPipe } from '@/common/pipes/filterEmptyPipe';
import { Response } from 'express';
import { HttpStatusCodes } from '@/common/constants/http-status';
import {
  UserResponseDto,
  UserResponseWrapperDto,
  UserListResponseWrapperDto,
} from './dto/response.dto';

@ApiTags('用户管理')
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: '操作成功' })
@ApiResponse({ status: 201, description: '操作成功，无返回内容' })
@ApiResponse({ status: 400, description: '参数错误' })
@ApiResponse({ status: 401, description: 'token失效，请重新登录' })
@ApiResponse({ status: 403, description: '权限不足' })
@ApiResponse({ status: 404, description: '请求资源不存在' })
@ApiResponse({ status: 500, description: '服务器异常，请联系管理员' })
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiOkResponse({ type: () => UserResponseWrapperDto, description: '创建用户成功' })
  create(@Headers('x-platform') platform: string, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, platform);
  }

  @Get()
  @ApiOperation({ summary: '查询用户列表(分页)' })
  @ApiOkResponse({ type: () => UserListResponseWrapperDto, description: '查询用户列表成功' })
  findByPage(
    @Headers('x-platform') platform: string,
    @Query(new FilterEmptyPipe()) findUserDtoByPage: FindUserDtoByPage
  ) {
    return this.usersService.findByPage(findUserDtoByPage, platform);
  }

  @Get('all')
  @ApiOperation({ summary: '查询用户列表(不分页)' })
  @ApiOkResponse({ type: () => UserListResponseWrapperDto, description: '查询用户列表成功' })
  findAll(
    @Headers('x-platform') platform: string,
    @Query(new FilterEmptyPipe()) findUserDto: FindUserDto
  ) {
    return this.usersService.findAll(findUserDto, platform);
  }

  @Get('export')
  @ApiOperation({ summary: '导出用户数据' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportUsers(
    @Headers('x-platform') platform: string,
    @Query(new FilterEmptyPipe()) findUserDtoByPage: FindUserDtoByPage,
    @Res() res: Response
  ) {
    const data = await this.usersService.exportUserList(findUserDtoByPage, platform);
    if ('buffer' in data) {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(data.fileName)}"`
      );
      res.setHeader('Access-Control-Expose-Headers', `Content-Disposition`);
      res.status(HttpStatusCodes.OK).send(data.buffer);
      return;
    }
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: '查询用户详情' })
  @ApiOkResponse({ type: () => UserResponseDto, description: '查询用户详情成功' })
  findOne(@Headers('x-platform') platform: string, @Param('id') id: string) {
    return this.usersService.findOne(id, platform);
  }
}
