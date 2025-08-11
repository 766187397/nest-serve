import { CreateBaseDto, FindByParameter, VerificationCodeDto } from "@/common/dto/base";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

/** 由于使用PartialType会丢失装饰器则抽离可选公用的参数 */
class UserOptionalDto extends CreateBaseDto {
  @ApiProperty({ description: "邮箱", required: false, example: "admin@qq.com" })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsOptional() // 可选
  @IsEmail({}, { message: "邮箱格式错误" })
  email?: string;

  @ApiProperty({ description: "手机号", required: false, example: "13800138000" })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsOptional()
  @Matches(/^1[3456789]\d{9}$/, { message: "手机号格式错误" }) // 正则校验
  phone?: string;

  @ApiProperty({ description: "性别 0未知 1男 2女", required: false, example: "0", enum: ["0", "1", "2"] })
  @IsOptional()
  @IsIn(["0", "1", "2"], { message: "性别只能是0、1、2" }) // 枚举校验
  sex?: string;

  @ApiProperty({ description: "头像", required: false, example: "" })
  @IsOptional()
  @IsString({ message: "头像地址必须是字符串" })
  avatar?: string;

  @ApiProperty({ description: "角色id", required: false, example: [1] })
  @IsOptional()
  @IsArray({ message: "角色id必须是数组" })
  roleIds?: number[];
}

/**
 * 用户创建Dto
 */
export class CreateUserDto extends UserOptionalDto {
  @ApiProperty({ description: "账号", example: "admin" })
  @IsString({ message: "账号字符串" })
  @IsNotEmpty({ message: "账号是必填项" }) // 必填校验
  account: string;

  @ApiProperty({ description: "昵称", example: "管理员" })
  @IsString({ message: "昵称字符串" })
  @IsNotEmpty({ message: "昵称是必填项" })
  nickName: string;

  @ApiProperty({ description: "密码", example: "123456" })
  @IsString({ message: "密码字符串" })
  @IsNotEmpty({ message: "密码是必填项" })
  password: string;
}

/** 用户更新Dto  */
export class UpdateUserDto extends UserOptionalDto {
  @ApiProperty({ description: "账号", example: "admin" })
  @IsOptional()
  @IsString({ message: "账号字符串" })
  account?: string | undefined;

  @ApiProperty({ description: "昵称", example: "管理员" })
  @IsOptional()
  @IsString({ message: "昵称字符串" })
  nickName?: string | undefined;

  @ApiProperty({ description: "密码", example: "123456" })
  @IsOptional()
  @IsString({ message: "密码字符串" })
  password?: string | undefined;
}

/**
 * 查询所有用户信息
 */
export class FindUserDto extends FindByParameter {
  @ApiProperty({ type: "string", description: "账号", required: false, example: "admin" })
  @IsOptional()
  @IsString()
  account?: string | undefined;

  @ApiProperty({ type: "string", description: "昵称", required: false, example: "管理员" })
  @IsOptional()
  @IsString()
  nickName?: string | undefined;

  // Transform 空值处理
  @ApiProperty({ type: "string", description: "邮箱", required: false, example: "admin@qq.com" })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsOptional()
  @IsEmail({}, { message: "邮箱格式错误" })
  email?: string | undefined;

  @ApiProperty({ type: "string", description: "手机号", required: false, example: "13800138000" })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsOptional()
  @Matches(/^1[3456789]\d{9}$/, { message: "手机号格式错误" })
  phone?: string | undefined;
}

/**
 * 分页查询用户信息
 */
export class FindUserDtoByPage extends FindUserDto {
  @ApiProperty({ name: "page", type: Number, required: false, description: "页码", default: 1 })
  @IsOptional()
  @IsString({ message: "page必须是字符串" })
  page?: string;

  @ApiProperty({ name: "pageSize", type: Number, required: false, description: "每页数量", default: 10 })
  @IsOptional()
  @IsString({ message: "pageSize必须是字符串" })
  pageSize?: string;
}

/** 登录 */
export class LogInDto extends VerificationCodeDto {
  @ApiProperty({ description: "账号", example: "admin" })
  @IsString({ message: "账号字符串" })
  @IsNotEmpty({ message: "账号是必填项" }) // 必填校验
  account: string;

  @ApiProperty({ description: "密码", example: "123456" })
  @IsString({ message: "密码字符串" })
  @IsNotEmpty({ message: "密码是必填项" })
  password: string;
}

/** 邮箱验证码 */
export class VerificationCodeLoginDto {
  @ApiProperty({ description: "验证码", example: "123456" })
  @IsString({ message: "验证码字符串" })
  @IsNotEmpty({ message: "验证码是必填项" })
  code: string;

  @ApiProperty({ description: "邮箱", example: "766187397@qq.com" })
  @IsEmail({}, { message: "邮箱格式错误" })
  @IsNotEmpty({ message: "邮箱是必填项" })
  email: string;
}
