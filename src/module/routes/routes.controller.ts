import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, Res } from "@nestjs/common";
import { RoutesService } from "./routes.service";
import { CreateRouteDto, FindRouteDto, UpdateRouteDto } from "./dto";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { User } from "@/module/users/entities/user.entity";

@ApiTags("admin - 路由管理")
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("api/v1/admin/routes")
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post("create")
  @ApiOperation({ summary: "创建路由" })
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get("all/admin")
  @ApiOperation({ summary: "查询admin所有路由" })
  findAllAdmin(@Query() findRouteDto: FindRouteDto) {
    return this.routesService.findAll(findRouteDto, "admin");
  }

  @Get("all/web")
  @ApiOperation({ summary: "查询web所有路由" })
  findAllWeb(@Query() findRouteDto: FindRouteDto) {
    return this.routesService.findAll(findRouteDto, "web");
  }

  @Get("info/:id")
  @ApiOperation({ summary: "获取路由详情" })
  findOne(@Param("id") id: string) {
    return this.routesService.findOne(+id);
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "修改路由信息" })
  update(@Param("id") id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(+id, updateRouteDto);
  }

  @Delete("delete/:id")
  @ApiOperation({ summary: "删除路由" })
  remove(@Param("id") id: string) {
    return this.routesService.remove(+id);
  }

  @Get("/by/role")
  @ApiQuery({
    name: "type",
    description: "路由类型",
    required: false,
    type: "string",
    example: "menu",
  })
  @ApiOperation({ summary: "根据登录用户的角色ids获取路由" })
  async getRoutesByRoleId(@Req() req: Request, @Res() res: Response) {
    const type = req.query.type as string;
    const userInfo = req.userInfo as User;
    const rolesIds = userInfo.roles.map((item) => item.id);
    let { __isApiResult, ...data } = await this.routesService.getRoutesByRoleId(rolesIds, userInfo.platform, type);
    res.status(data.code).json(data);
  }
}
