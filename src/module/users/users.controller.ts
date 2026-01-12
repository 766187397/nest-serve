import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  Req,
  Header,
  Headers,
  HttpCode,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import {
  CreateUserDto,
  UpdateUserDto,
  FindUserDto,
  FindUserDtoByPage,
  LogInDto,
  VerificationCodeLoginDto,
  CaptchaDto,
} from "./dto/index";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FilterEmptyPipe } from "@/common/pipeTransform/filterEmptyPipe";
import { Request, Response } from "express";
import { getPlatformJwtConfig, JwtConfig } from "@/config/jwt";
import { ApiResult } from "@/common/utils/result";
import { UserLogin } from "@/types/user";
import {
  BusinessStatusCodes,
  HttpStatusCodes,
} from "@/common/constants/http-status";

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

  @Post()
  @ApiOperation({ summary: "创建用户" })
  create(
    @Headers("x-platform") platform: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto, platform);
  }

  @Get()
  @ApiOperation({ summary: "查询用户列表(分页)" })
  findByPage(
    @Headers("x-platform") platform: string,
    @Query(new FilterEmptyPipe()) findUserDtoByPage: FindUserDtoByPage,
  ) {
    return this.usersService.findByPage(findUserDtoByPage, platform);
  }

  @Get("all")
  @ApiOperation({ summary: "查询用户列表(不分页)" })
  findAll(
    @Headers("x-platform") platform: string,
    @Query(new FilterEmptyPipe()) findUserDto: FindUserDto,
  ) {
    return this.usersService.findAll(findUserDto, platform);
  }

  @Get("captcha")
  @ApiOperation({ summary: "获取验证码" })
  async captcha(@Query(new FilterEmptyPipe()) captchaDto: CaptchaDto) {
    return await this.usersService.captcha(captchaDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "查询用户详情" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新用户信息" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除用户" })
  @HttpCode(204)
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @Post("login")
  @ApiOperation({ summary: "用户登录" })
  logIn(@Body() loginDto: LogInDto) {
    return this.usersService.logIn(loginDto, "admin");
  }

  @Post("login/set-cookie")
  @ApiOperation({ summary: "用户登录(设置Cookie)" })
  async logInSetCookie(@Body() loginDto: LogInDto, @Res() res: Response) {
    const { __isApiResult, ...data } = await this.usersService.logIn(
      loginDto,
      "admin",
    );
    if (data.code == 200) {
      const options = getPlatformJwtConfig("admin") as JwtConfig;
      res.cookie("token", (data?.data as UserLogin).access_token, {
        maxAge: Number(options.jwt_expires_in),
      });
      res.cookie("refresh_token", (data?.data as UserLogin).refresh_token, {
        maxAge: Number(options.jwt_refresh_expires_in),
      });
      res.status(data.code).json(data);
    } else {
      res.status(data.code).json(data);
    }
  }

  @Post("login/verification-code")
  @ApiOperation({ summary: "邮箱验证码登录" })
  async verificationCodeLogin(
    @Body() verificationCodeLogin: VerificationCodeLoginDto,
  ) {
    return this.usersService.VerificationCodeLogin(
      verificationCodeLogin,
      "admin",
    );
  }

  @Get("refresh-token")
  @ApiOperation({ summary: "刷新token" })
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    let refresh_token: string | undefined;
    if (req.cookies && req.cookies.refresh_token) {
      refresh_token = req.cookies.refresh_token;
    }
    if (!refresh_token) {
      refresh_token = (req.headers["refresh_token"] as string)?.split(" ")[1];
    }
    if (!refresh_token) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        code: HttpStatusCodes.UNAUTHORIZED,
        message: "refreshToken不存在，请先登录！",
        data: null,
      });
      return;
    }
    const { __isApiResult, ...data } = await this.usersService.refreshToken(
      refresh_token,
      "admin",
    );
    if (data.code == BusinessStatusCodes.SUCCESS) {
      const options = getPlatformJwtConfig("admin") as JwtConfig;
      res.cookie("token", (data?.data as UserLogin).access_token, {
        maxAge: Number(options.jwt_expires_in),
      });
    }
    res.status(data.code).json(data);
  }

  @Post("logout")
  @ApiOperation({ summary: "退出登录清除Cookie" })
  @HttpCode(204)
  logout(@Res() res: Response) {
    res.cookie("token", "", { expires: new Date(0) });
    res.cookie("refresh_token", "", { expires: new Date(0) });
    res.status(204).send();
  }

  @Get("export")
  @ApiOperation({ summary: "导出用户数据" })
  @Header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  async exportUsers(
    @Headers("x-platform") platform: string,
    @Query(new FilterEmptyPipe()) findUserDtoByPage: FindUserDtoByPage,
    @Res() res: Response,
  ) {
    const data = await this.usersService.exportUserList(
      findUserDtoByPage,
      platform,
    );
    if ("buffer" in data) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(data.fileName)}"`,
      );
      res.setHeader("Access-Control-Expose-Headers", `Content-Disposition`);
      res.status(HttpStatusCodes.OK).send(data.buffer);
      return;
    }
    const { __isApiResult, ...dataResult } = data;
    return dataResult;
  }
}
