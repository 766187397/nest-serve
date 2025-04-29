import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, Req } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ProcessDataThroughID } from "@/common/dto/base";
import { CreateUserDto, UpdateUserDto, FindUserDto, FindUserDtoByPage, LogInDto } from "./dto/index";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";
import { Request, Response } from "express";

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
  findByPage(@Query(new FilterEmptyPipe()) findUserDtoByPage: FindUserDtoByPage) {
    return this.usersService.findByPage(findUserDtoByPage);
  }

  @Get()
  @ApiOperation({ summary: "查询用户列表(不分页)" })
  findAll(@Query(new FilterEmptyPipe()) findUserDto: FindUserDto) {
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

  @Post("/logIn")
  @ApiOperation({ summary: "用户登录" })
  logIn(@Body() loginDto: LogInDto) {
    return this.usersService.logIn(loginDto);
  }

  @Post("/logIn/setCookie")
  @ApiOperation({ summary: "用户登录(设置Cookie)" })
  async logInSetCookie(@Body() loginDto: LogInDto, @Res() res: Response) {
    let { __isApiResult, ...data } = await this.usersService.logIn(loginDto);
    if (data.code == 200) {
      res.cookie("token", data.data.access_token, { maxAge: 1000 * 60 * 60 * Number(process.env.JWT_EXPIRES_IN) });
      res.cookie("refresh_token", data.data.refresh_token, {
        maxAge: 1000 * 60 * 60 * 24 * Number(process.env.JWT_EXPIRES_IN),
      });
      res.json(data);
    } else {
      res.status(data.code).json(data);
    }
  }

  @Get("refresh/token")
  @ApiOperation({ summary: "刷新token" })
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    let refresh_token: string | undefined;
    // 首先尝试从 Cookie 中获取 Token
    if (req.cookies && req.cookies.refresh_token) {
      refresh_token = req.cookies.refresh_token;
    }
    // 如果没有从 Cookie 中获取到 refreshToken，则尝试从请求头中获取
    if (!refresh_token) {
      refresh_token = (req.headers["refresh_token"] as string)?.split(" ")[1]; // 从请求头获取 Bearer Token
    }
    if (!refresh_token) {
      return res.status(401).json({ code: 401, message: "refreshToken不存在，请先登录！", data: null });
    }
    let { __isApiResult, ...data } = await this.usersService.refreshToken(refresh_token);
    if (data.code == 200) {
      res.cookie("token", data.data.access_token, { maxAge: 1000 * 60 * 60 * Number(process.env.JWT_EXPIRES_IN) });
    }
    res.status(data.code).json(data);
  }
}
