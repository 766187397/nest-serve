import { ApiProperty } from '@nestjs/swagger';
import { ApiResultWrapperDto } from '@/common/dto/base';
import { RouteResponseDto } from '@/modules/routes/dto/response.dto';

/** 角色信息响应DTO */
export class RoleResponseDto {
  @ApiProperty({ description: '角色ID', example: '1' })
  id: string;

  @ApiProperty({ description: '角色名称', example: 'admin' })
  name: string;

  @ApiProperty({ description: '角色标识', example: 'admin' })
  roleKey: string;

  @ApiProperty({ description: '角色描述', example: '管理员' })
  description: string;

  @ApiProperty({ description: '排序', example: 1 })
  sort: number;

  @ApiProperty({ description: '状态 0禁用 1启用', example: 1 })
  status: number;

  @ApiProperty({ description: '路由列表', type: [RouteResponseDto], required: false })
  routes?: RouteResponseDto[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date | string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date | string;
}

/** 角色信息响应包装 DTO */
export class RoleResponseWrapperDto extends ApiResultWrapperDto<RoleResponseDto> {
  @ApiProperty({ description: '响应数据', type: RoleResponseDto })
  declare data: RoleResponseDto;
}

/** 角色列表响应包装 DTO */
export class RoleListResponseWrapperDto extends ApiResultWrapperDto<RoleResponseDto[]> {
  @ApiProperty({ description: '响应数据', type: [RoleResponseDto] })
  declare data: RoleResponseDto[];
}
