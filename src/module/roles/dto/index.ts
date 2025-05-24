import { CreateBaseDto, FindByParameter } from "@/common/dto/base";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

class RoleOptionalDto extends CreateBaseDto {
  @ApiProperty({ description: "角色描述", example: "管理员" })
  @IsString({ message: "角色描述必须为字符串" })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "角色key", example: "0" })
  @IsString({ message: "角色key必须为字符串" })
  @IsOptional()
  roleKey?: string;

  @ApiProperty({ description: "路由id", required: false, example: [1] })
  @IsOptional()
  @IsArray({ message: "routeIds必须为数字数组" })
  routeIds?: number[];
}

/** 创建角色 */
export class CreateRoleDto extends RoleOptionalDto {
  @ApiProperty({ description: "角色名称", example: "admin" })
  @IsString({ message: "角色名称必须为字符串" })
  @IsNotEmpty({ message: "角色名称不能为空" })
  name: string;
}

/** 更新角色信息 */
export class UpdateRoleDto extends RoleOptionalDto {
  @ApiProperty({ description: "角色名称", example: "admin" })
  @IsString({ message: "角色名称必须为字符串" })
  @IsOptional()
  name?: string;
}

/** 查询所有角色信息 */
export class FindRoleDto extends FindByParameter {
  @ApiProperty({ description: "角色名称", example: "admin" })
  @IsString({ message: "角色名称必须为字符串" })
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "角色key", example: "admin" })
  @IsString({ message: "角色key必须为字符串" })
  @IsOptional()
  roleKey?: string;
}

/** 分页查询角色信息 */
export class FindRoleDtoByPage extends FindRoleDto {
  @ApiProperty({ name: "page", type: Number, required: false, description: "页码", default: 1 })
  @IsOptional()
  @IsString({ message: "page必须是字符串" })
  page?: string;

  @ApiProperty({ name: "pageSize", type: Number, required: false, description: "每页数量", default: 10 })
  @IsOptional()
  @IsString({ message: "pageSize必须是字符串" })
  pageSize?: string;
}
