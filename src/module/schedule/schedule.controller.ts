import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  FindScheduleDtoByPage,
  FindScheduleLogDtoByPage,
} from './dto/index';
import { ApiOperation, ApiResponse, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { FilterEmptyPipe } from '@/common/pipeTransform/filterEmptyPipe';
import {
  ScheduleResponseDto,
  ScheduleLogResponseDto,
  ScheduleResponseWrapperDto,
  ScheduleListResponseWrapperDto,
  ScheduleLogResponseWrapperDto,
  ScheduleLogListResponseWrapperDto,
} from './dto/response.dto';

@ApiTags('定时任务管理')
@ApiResponse({ status: 200, description: '操作成功' })
@ApiResponse({ status: 201, description: '操作成功，无返回内容' })
@ApiResponse({ status: 400, description: '参数错误' })
@ApiResponse({ status: 401, description: 'token失效，请重新登录' })
@ApiResponse({ status: 403, description: '权限不足' })
@ApiResponse({ status: 404, description: '请求资源不存在' })
@ApiResponse({ status: 500, description: '服务器异常，请联系管理员' })
@Controller('api/v1/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @ApiOperation({ summary: '创建定时任务' })
  @ApiOkResponse({ type: () => ScheduleResponseWrapperDto, description: '创建定时任务成功' })
  create(@Headers('x-platform') platform: string, @Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto, platform);
  }

  @Get()
  @ApiOperation({ summary: '查询定时任务列表(分页)' })
  @ApiOkResponse({ type: () => ScheduleListResponseWrapperDto, description: '查询定时任务列表成功' })
  findByPage(
    @Headers('x-platform') platform: string,
    @Query(new FilterEmptyPipe()) query: FindScheduleDtoByPage
  ) {
    return this.scheduleService.findByPage(query, platform);
  }

  @Get('all')
  @ApiOperation({ summary: '查询定时任务列表(不分页)' })
  @ApiOkResponse({ type: () => ScheduleListResponseWrapperDto, description: '查询定时任务列表成功' })
  findAll(
    @Headers('x-platform') platform: string,
    @Query(new FilterEmptyPipe()) query: Record<string, unknown>
  ) {
    return this.scheduleService.findAll(query, platform);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询定时任务详情' })
  @ApiOkResponse({ type: () => ScheduleResponseWrapperDto, description: '查询定时任务详情成功' })
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新定时任务' })
  @ApiOkResponse({ type: () => ScheduleResponseWrapperDto, description: '更新定时任务成功' })
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除定时任务' })
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '启用/禁用定时任务' })
  @ApiOkResponse({ type: () => ScheduleResponseWrapperDto, description: '启用/禁用定时任务成功' })
  toggleStatus(@Param('id') id: string, @Body('status') status: number) {
    return this.scheduleService.toggleStatus(id, status);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: '手动执行定时任务' })
  @ApiOkResponse({ type: () => ScheduleResponseWrapperDto, description: '手动执行定时任务成功' })
  executeManually(@Param('id') id: string) {
    return this.scheduleService.executeManually(id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: '查询定时任务执行日志(分页)' })
  @ApiOkResponse({ type: () => ScheduleLogListResponseWrapperDto, description: '查询定时任务执行日志成功' })
  findLogsByPage(
    @Headers('x-platform') platform: string,
    @Param('id') id: string,
    @Query(new FilterEmptyPipe()) query: FindScheduleLogDtoByPage
  ) {
    return this.scheduleService.findLogsByPage({ ...query, scheduleId: id }, platform);
  }
}
