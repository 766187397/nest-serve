import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, Req, Header } from "@nestjs/common";
import { UsersService } from "./users.service";
import {
  CreateUserDto,
  UpdateUserDto,
  FindUserDto,
  FindUserDtoByPage,
  LogInDto,
  VerificationCodeLoginDto,
} from "./dto/index";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";
import { Request, Response } from "express";
import { getPlatformJwtConfig, JwtConfig } from "@/config/jwt";
import { ApiResult } from "@/common/utils/result";
import { UserLogin } from "@/types/user";
import * as XLSX from "xlsx";

@ApiTags("用户管理")
// @ApiBearerAuth("Authorization")
@ApiResponse({ status: 200, description: "操作成功" })
@ApiResponse({ status: 201, description: "操作成功，无返回内容" })
@ApiResponse({ status: 400, description: "参数错误" })
@ApiResponse({ status: 401, description: "token失效，请重新登录" })
@ApiResponse({ status: 403, description: "权限不足" })
@ApiResponse({ status: 404, description: "请求资源不存在" })
@ApiResponse({ status: 500, description: "服务器异常，请联系管理员" })
@Controller("api/v1/admin/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("create/:platform")
  @ApiOperation({ summary: "创建用户" })
  create(@Param("platform") platform: string, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, platform);
  }

  @Get("page/:platform")
  @ApiOperation({ summary: "查询用户列表(分页)" })
  findByPage(@Param("platform") platform: string, @Query(new FilterEmptyPipe()) findUserDtoByPage: FindUserDtoByPage) {
    return this.usersService.findByPage(findUserDtoByPage, platform);
  }

  @Get("all/:platform")
  @ApiOperation({ summary: "查询用户列表(不分页)" })
  findAll(@Param("platform") platform: string, @Query(new FilterEmptyPipe()) findUserDto: FindUserDto) {
    return this.usersService.findAll(findUserDto, platform);
  }

  @Get("info/:id")
  @ApiOperation({ summary: "查询用户详情" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch("update/:id")
  @ApiOperation({ summary: "更新用户信息" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete("delete/:id")
  @ApiOperation({ summary: "删除用户" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @Post("logIn")
  @ApiOperation({ summary: "用户登录" })
  logIn(@Body() loginDto: LogInDto) {
    return this.usersService.logIn(loginDto, "admin");
  }

  @Post("logIn/setCookie")
  @ApiOperation({ summary: "用户登录(设置Cookie)" })
  async logInSetCookie(@Body() loginDto: LogInDto, @Res() res: Response) {
    let { __isApiResult, ...data } = await this.usersService.logIn(loginDto, "admin");
    if (data.code == 200) {
      const options = getPlatformJwtConfig("admin") as JwtConfig;
      res.cookie("token", (data?.data as UserLogin).access_token, { maxAge: Number(options.jwt_expires_in) });
      res.cookie("refresh_token", (data?.data as UserLogin).refresh_token, {
        maxAge: Number(options.jwt_refresh_expires_in),
      });
      res.status(data.code).json(data);
      // 返回 data 让数据经过 interceptor 处理
      // 这样可以确保日志记录等功能正常工作
      return data;
    } else {
      res.status(data.code).json(data);
    }
  }

  @Post("logIn/verificationCode")
  @ApiOperation({ summary: "邮箱验证码登录" })
  async verificationCodeLogin(@Body() verificationCodeLogin: VerificationCodeLoginDto) {
    return this.usersService.VerificationCodeLogin(verificationCodeLogin, "admin");
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
      res.status(401).json({ code: 401, message: "refreshToken不存在，请先登录！", data: null });
    }
    let { __isApiResult, ...data } = await this.usersService.refreshToken(refresh_token, "admin");
    if (data.code == 200) {
      const options = getPlatformJwtConfig("admin") as JwtConfig;
      res.cookie("token", (data?.data as UserLogin).access_token, { maxAge: Number(options.jwt_expires_in) });
    }
    res.status(data.code).json(data);
    // 返回 data 让数据经过 interceptor 处理
    // 这样可以确保日志记录等功能正常工作
    return data;
  }

  @Get("logout")
  @ApiOperation({ summary: "退出登录清除Cookie" })
  logout(@Res() res: Response) {
    res.cookie("token", "", { expires: new Date(0) });
    res.cookie("refresh_token", "", { expires: new Date(0) });
    const { __isApiResult, ...data } = ApiResult.success({ data: null });
    res.status(200).json(data);
  }

  @Get("export/:platform")
  @ApiOperation({ summary: "导出用户数据" })
  @Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  async exportUsers(
    @Param("platform") platform: string,
    @Query(new FilterEmptyPipe()) findUserDto: FindUserDto,
    @Res() res: Response
  ) {
    // return
    console.log("res", res);
    const data = await this.usersService.exportUserList(findUserDto, platform);
    if ("buffer" in data) {
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(data.fileName)}"`);
      // 4. 发送文件
      res.status(200).send(data.buffer);
      return;
    }
    const { __isApiResult, ...dataResult } = data as ApiResult<null>;
    return dataResult;
  }
}
