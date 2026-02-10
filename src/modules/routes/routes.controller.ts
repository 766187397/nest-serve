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
import { RoutesService } from './routes.service';
import { CreateRouteDto, FindRouteDto, UpdateRouteDto } from './dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@/modules/users/entities/user.entity';
import { FilterEmptyPipe } from '@/common/pipeTransform/filterEmptyPipe';
import { HttpStatusCodes } from '@/common/constants/http-status';
import {
  RouteResponseWrapperDto,
  RouteListResponseWrapperDto,
  RoleRoutesListResponseWrapperDto,
} from './dto/response.dto';

@ApiTags('路由管理')
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: '操作成功' })
@ApiResponse({ status: 201, description: '操作成功，无返回内容' })
@ApiResponse({ status: 400, description: '参数错误' })
@ApiResponse({ status: 401, description: 'token失效，请重新登录' })
@ApiResponse({ status: 403, description: '权限不足' })
@ApiResponse({ status: 404, description: '请求资源不存在' })
@ApiResponse({ status: 500, description: '服务器异常，请联系管理员' })
@Controller('api/v1/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get('by-role')
  @ApiQuery({
    name: 'type',
    description: '路由类型',
    required: false,
    type: 'string',
    example: 'menu',
  })
  @ApiOperation({ summary: '根据登录用户的角色ids获取路由' })
  @ApiOkResponse({
    type: () => RoleRoutesListResponseWrapperDto,
    description: '根据登录用户的角色ids获取路由成功',
  })
  async getRoutesByRoleId(@Req() req: Request) {
    const type = req.query.type as string;
    const userInfo = req.userInfo as User;
    const rolesIds = userInfo.roles.map((item) => item.id);
    return this.routesService.getRoutesByRoleId(rolesIds, userInfo.platform, type);
  }

  @Post()
  @ApiOperation({ summary: '创建路由' })
  @ApiOkResponse({ type: () => RouteResponseWrapperDto, description: '创建路由成功' })
  create(@Headers('x-platform') platform: string, @Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto, platform);
  }

  @Get()
  @ApiOperation({ summary: '查询所有路由' })
  @ApiOkResponse({ type: () => RouteListResponseWrapperDto, description: '查询所有路由成功' })
  findAll(
    @Headers('x-platform') platform: string,
    @Query(new FilterEmptyPipe()) findRouteDto: FindRouteDto
  ) {
    return this.routesService.findAll(findRouteDto, platform);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取路由详情' })
  @ApiOkResponse({ type: () => RouteResponseWrapperDto, description: '获取路由详情成功' })
  findOne(@Headers('x-platform') platform: string, @Param('id') id: string) {
    return this.routesService.findOne(id, platform);
  }

  @Patch(':id')
  @ApiOperation({ summary: '修改路由信息' })
  @ApiOkResponse({ type: () => RouteResponseWrapperDto, description: '修改路由信息成功' })
  update(
    @Headers('x-platform') platform: string,
    @Param('id') id: string,
    @Body() updateRouteDto: UpdateRouteDto
  ) {
    return this.routesService.update(id, updateRouteDto, platform);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除路由' })
  @HttpCode(HttpStatusCodes.NO_CONTENT)
  remove(@Headers('x-platform') platform: string, @Param('id') id: string) {
    return this.routesService.remove(id, platform);
  }
}
