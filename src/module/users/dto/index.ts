import { CreateBaseDto, FindByParameter } from "@/common/dto/base";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

/**
 * 用户创建Dto
 */
export class CreateUserDto extends CreateBaseDto {
  @ApiProperty({ description: "用户名", example: "admin" })
  @IsString({ message: "用户名字符串" })
  @IsNotEmpty({ message: "用户名是必填项" }) // 必填校验
  userName: string;

  @ApiProperty({ description: "昵称", example: "管理员" })
  @IsString({ message: "昵称字符串" })
  @IsNotEmpty({ message: "昵称是必填项" })
  nickName: string;

  @ApiProperty({ description: "密码", example: "123456" })
  @IsString({ message: "密码字符串" })
  @IsNotEmpty({ message: "密码是必填项" })
  password: string;

  @ApiProperty({ description: "邮箱", required: false, example: "admin@qq.com" })
  @IsOptional() // 可选
  @IsEmail({}, { message: "邮箱格式错误" })
  email?: string;

  @ApiProperty({ description: "手机号", required: false, example: "13800138000" })
  @IsOptional()
  @Matches(/^1[3456789]\d{9}$/, { message: "手机号格式错误" }) // 正则校验
  phone?: string;

  @ApiProperty({ description: "性别 0未知 1男 2女", required: false, example: "0", enum: ["0", "1", "2"] })
  @IsOptional()
  @IsIn(["0", "1", "2"], { message: "性别只能是0、1、2" }) // 枚举校验
  sex?: string;

  @ApiProperty({ description: "头像", required: false, example: "" })
  @IsOptional()
  @IsString()
  avatar?: string;
}

/**
 * 用户更新Dto
 */
export class UpdateUserDto {
  @ApiProperty({ description: "用户名", example: "admin" })
  @IsOptional()
  @IsString()
  userName?: string | undefined;

  @ApiProperty({ description: "昵称", example: "管理员" })
  @IsOptional()
  @IsString()
  nickName?: string | undefined;

  @ApiProperty({ description: "密码", example: "123456" })
  @IsString()
  password?: string | undefined;

  @ApiProperty({ description: "邮箱", required: false, example: "admin@qq.com" })
  @IsOptional()
  @IsEmail({}, { message: "邮箱格式错误" })
  email?: string | undefined;

  @ApiProperty({ description: "手机号", required: false, example: "13800138000" })
  @IsOptional()
  @Matches(/^1[3456789]\d{9}$/, { message: "手机号格式错误" })
  phone?: string | undefined;

  @ApiProperty({ description: "性别 0未知 1男 2女", required: false, example: "0", enum: ["0", "1", "2"] })
  @IsOptional()
  @IsIn(["0", "1", "2"], { message: "性别只能是0、1、2" })
  sex?: string | undefined;

  @ApiProperty({ description: "头像", required: false, example: "" })
  @IsOptional()
  @IsString()
  avatar?: string | undefined;
}

/**
 * 查询所有用户信息
 */
export class FindUserDto extends FindByParameter {
  @ApiProperty({ type: "string", description: "用户名", required: false, example: "admin" })
  @IsOptional()
  @IsString()
  userName?: string | undefined;

  @ApiProperty({ type: "string", description: "昵称", required: false, example: "管理员" })
  @IsOptional()
  @IsString()
  nickName?: string | undefined;

  @ApiProperty({ type: "string", description: "邮箱", required: false, example: "admin@qq.com" })
  @IsOptional()
  @IsEmail({}, { message: "邮箱格式错误" })
  email?: string | undefined;

  @ApiProperty({ type: "string", description: "手机号", required: false, example: "13800138000" })
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
