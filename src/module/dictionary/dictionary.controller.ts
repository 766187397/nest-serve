import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { DictionaryService } from "./dictionary.service";
import {
  CreateDictionaryDto,
  CreateDictionaryItemDto,
  FindDictionaryDto,
  FindDictionaryDtoByPage,
  FindDictionaryItemDto,
  FindDictionaryItemDtoByPage,
  UpdateDictionaryDto,
  UpdateDictionaryItemDto,
} from "./dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("字典管理")
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("api/v1/admin/dictionary")
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Post("create")
  @ApiOperation({ summary: "字典分类创建" })
  create(@Body() createDictionaryDto: CreateDictionaryDto) {
    return this.dictionaryService.create(createDictionaryDto);
  }

  @Get("page")
  @ApiOperation({ summary: "字典分类分页查询" })
  findByPage(@Query() findDictionaryDtoByPage: FindDictionaryDtoByPage) {
    return this.dictionaryService.findByPage(findDictionaryDtoByPage);
  }

  @Get("all")
  @ApiOperation({ summary: "查询所有字典分类" })
  findAll(@Query() findDictionaryDto: FindDictionaryDto) {
    return this.dictionaryService.findAll(findDictionaryDto);
  }

  @Get("info/:id")
  @ApiOperation({ summary: "查询字典分类详情" })
  findOne(@Param("id") id: string) {
    return this.dictionaryService.findOne(id);
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "更新字典分类信息" })
  update(@Param("id") id: string, @Body() updateDictionaryDto: UpdateDictionaryDto) {
    return this.dictionaryService.update(id, updateDictionaryDto);
  }

  @Delete("delete/:id")
  @ApiOperation({ summary: "删除字典分类" })
  remove(@Param("id") id: string) {
    return this.dictionaryService.remove(id);
  }
}

@ApiTags("字典项管理")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("api/v1/admin/dictionaryItem")
export class DictionaryItemController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Post("create")
  @ApiOperation({ summary: "字典项创建" })
  create(@Body() createDictionaryItemDto: CreateDictionaryItemDto) {
    return this.dictionaryService.createItem(createDictionaryItemDto);
  }

  @Get("page")
  @ApiOperation({ summary: "字典项分页查询" })
  findByPage(@Query() findDictionaryItemDtoByPage: FindDictionaryItemDtoByPage) {
    return this.dictionaryService.findItemByPage(findDictionaryItemDtoByPage);
  }

  @Get("all")
  @ApiOperation({ summary: "查询所有字典项" })
  findAll(@Query() findDictionaryItemDto: FindDictionaryItemDto) {
    return this.dictionaryService.findItemAll(findDictionaryItemDto);
  }

  @Get("info/:id")
  @ApiOperation({ summary: "查询字典项详情" })
  findOne(@Param("id") id: string) {
    return this.dictionaryService.findItemOne(id);
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "更新字典项信息" })
  update(@Param("id") id: string, @Body() updateDictionaryItemDto: UpdateDictionaryItemDto) {
    return this.dictionaryService.updateItem(id, updateDictionaryItemDto);
  }

  @Delete("delete/:id")
  @ApiOperation({ summary: "删除字典项" })
  remove(@Param("id") id: string) {
    return this.dictionaryService.removeItem(id);
  }
}
