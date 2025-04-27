import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ProcessDataThroughID } from "@/common/dto/base";
import { CreateUserDto, UpdateUserDto, FindUserDto, FindUserDtoByPage } from "./dto/index";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("用户管理")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("api/v1/backend/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "创建用户" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get("/page")
  @ApiOperation({ summary: "查询用户列表(分页)" })
  findByPage(@Query() findUserDtoByPage: FindUserDtoByPage) {
    return this.usersService.findByPage(findUserDtoByPage);
  }

  @Get()
  @ApiOperation({ summary: "查询用户列表(不分页)" })
  findAll(@Query() findUserDto: FindUserDto) {
    return this.usersService.findAll(findUserDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "查询用户详情" })
  findOne(@Param("id") id: ProcessDataThroughID) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新用户信息" })
  update(@Param("id") id: ProcessDataThroughID, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除用户" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
