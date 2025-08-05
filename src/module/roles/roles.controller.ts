import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { CreateRoleDto, FindRoleDto, FindRoleDtoByPage, UpdateRoleDto } from "./dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";

@ApiTags("角色管理")
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("api/v1/admin/roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post("create/:platform")
  @ApiOperation({ summary: "创建角色" })
  create(@Param("platform") platform: string, @Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto, platform);
  }

  @Get("page/:platform")
  @ApiOperation({ summary: "查询角色列表(分页)" })
  findByPage(@Param("platform") platform: string, @Query(new FilterEmptyPipe()) findRoleDtoByPage: FindRoleDtoByPage) {
    return this.rolesService.findByPage(findRoleDtoByPage, platform);
  }

  @Get("all/:platform")
  @ApiOperation({ summary: "查询角色列表(不分页)" })
  findAll(@Param("platform") platform: string, @Body() findRoleDto: FindRoleDto) {
    return this.rolesService.findAll(findRoleDto, platform);
  }

  @Get("info/:id")
  @ApiOperation({ summary: "查询角色详情" })
  findOne(@Param("id") id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新角色" })
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除角色" })
  remove(@Param("id") id: string) {
    return this.rolesService.remove(id);
  }
}
