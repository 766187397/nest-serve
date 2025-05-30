import { CreateBaseDto, FindByParameter } from "@/common/dto/base";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

class RouteOptionalDto extends CreateBaseDto {
  @ApiProperty({ description: "Vue组件路径（物理路径）", required: false })
  @IsOptional()
  @IsString({ message: "组件必须为字符串" })
  component?: string;

  @ApiProperty({ description: "其他携带信息", required: false })
  @IsOptional()
  @IsString({ message: "携带信息必须为字符串" })
  meta?: string;

  @ApiProperty({ description: "图标", required: false })
  @IsOptional()
  @IsString({ message: "图标必须为字符串" })
  icon?: string;

  @ApiProperty({ description: "父级路由id", required: false })
  @IsOptional()
  @IsInt({ message: "父级路由id必须为数字" })
  parentId?: number;

  @ApiProperty({ description: "是否为外链", default: false, required: false })
  @IsOptional()
  @IsBoolean({ message: "是否为外链必须为布尔值" })
  externalLinks?: boolean;

  @ApiProperty({ description: "重定向地址", default: false, required: false })
  @IsOptional()
  @IsString({ message: "是否为重定向必须为字符串" })
  redirect?: string;
}

export class CreateRouteDto extends RouteOptionalDto {
  @ApiProperty({ description: "平台标识（如admin/web/app/mini等）", required: false })
  @IsNotEmpty({ message: "平台类型不能为空" })
  @IsString({ message: "平台必须为字符串" })
  platform: string;

  @ApiProperty({ description: "路由类型：菜单/按钮/API等", required: true })
  @IsString({ message: "路由类型必须为字符串" })
  @IsNotEmpty({ message: "路由类型不能为空" })
  type: string;

  @ApiProperty({ description: "路由名称", required: true })
  @IsString({ message: "路由名称必须为字符串" })
  @IsNotEmpty({ message: "路由名称不能为空" })
  name: string;

  @ApiProperty({ description: "路由显示名称", required: true })
  @IsString({ message: "路由显示名称必须为字符串" })
  @IsNotEmpty({ message: "路由显示名称不能为空" })
  title: string;

  @ApiProperty({ description: "前端路由路径（可以含动态参数）", required: false })
  @IsString({ message: "路由路径必须为字符串" })
  @IsNotEmpty({ message: "路由路径不能为空" })
  path: string;
}

export class UpdateRouteDto extends RouteOptionalDto {
  @ApiProperty({ description: "前端路由路径（可以含动态参数）", required: false })
  @IsString({ message: "路由路径必须为字符串" })
  @IsNotEmpty({ message: "路由路径不能为空" })
  path?: string;

  @ApiProperty({ description: "平台标识（如admin/web/app/mini等）", required: false })
  @IsOptional()
  @IsString({ message: "平台必须为字符串" })
  platform?: string;

  @ApiProperty({ description: "路由类型：菜单/按钮/API等", required: false })
  @IsOptional()
  @IsString({ message: "路由类型必须为字符串" })
  type: string;

  @ApiProperty({ description: "路由名称", required: false })
  @IsOptional()
  @IsString({ message: "路由名称必须为字符串" })
  name: string;

  @ApiProperty({ description: "路由显示名称", required: false })
  @IsOptional()
  @IsString({ message: "路由显示名称必须为字符串" })
  title: string;
}

export class FindRouteDto extends FindByParameter {
  @ApiProperty({ description: "平台标识（如admin/web/app/mini等）", required: false })
  @IsOptional()
  @IsString({ message: "平台必须为字符串" })
  platform?: string;

  @ApiProperty({ description: "路由类型：菜单/按钮/API等", required: false })
  @IsOptional()
  @IsString({ message: "路由类型必须为字符串" })
  type?: string;

  @ApiProperty({ description: "路由名称", required: false })
  @IsOptional()
  @IsString({ message: "路由名称必须为字符串" })
  name?: string;

  @ApiProperty({ description: "路由显示名称", required: false })
  @IsOptional()
  @IsString({ message: "路由显示名称必须为字符串" })
  title?: string;
}
