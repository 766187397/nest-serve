import { ApiProperty } from '@nestjs/swagger';
import { ApiResultWrapperDto } from '@/common/dto/base';

/** 路由元信息响应DTO */
export class RouteMetaResponseDto {
  @ApiProperty({ description: '标题', example: '用户管理' })
  title: string;

  @ApiProperty({ description: '图标', example: 'user' })
  icon: string;

  @ApiProperty({ description: '是否外链', example: false })
  externalLinks: boolean;

  @ApiProperty({ description: '类型', example: 'menu' })
  type: string;

  @ApiProperty({ description: '状态', example: 1 })
  status: number;

  [key: string]: unknown;
}

/** 角色路由响应DTO */
export class RoleRoutesResponseDto {
  @ApiProperty({ description: '路由路径', example: '/users' })
  path: string;

  @ApiProperty({ description: '路由名称', example: 'UserManagement' })
  name: string;

  @ApiProperty({ description: '组件路径', example: '@/views/users/index.vue' })
  component: string;

  @ApiProperty({ description: '路由元信息', type: RouteMetaResponseDto })
  meta: RouteMetaResponseDto;

  @ApiProperty({ description: '子路由', type: [RoleRoutesResponseDto], required: false })
  children?: RoleRoutesResponseDto[];
}

/** 路由信息响应DTO */
export class RouteResponseDto {
  @ApiProperty({ description: '路由ID', example: '1' })
  id: string;

  @ApiProperty({ description: '路由类型：菜单/按钮/API等', example: 'menu' })
  type: string;

  @ApiProperty({ description: '路由名称（跳转）', example: '用户管理' })
  name: string;

  @ApiProperty({ description: '路由显示名称', example: '用户管理' })
  title: string;

  @ApiProperty({ description: '前端路由路径（含动态参数）', example: '/users' })
  path: string;

  @ApiProperty({ description: 'Vue组件路径（物理路径）', example: '@/views/users/index.vue' })
  component: string;

  @ApiProperty({ description: '其他携带信息json字符串(object对象的形式)', example: '{"icon":"user"}' })
  meta: string;

  @ApiProperty({ description: '图标标识', example: 'user' })
  icon: string;

  @ApiProperty({ description: '是否为外链', example: false })
  externalLinks: boolean;

  @ApiProperty({ description: '重定向地址', example: '' })
  redirect: string;

  @ApiProperty({ description: '排序', example: 1 })
  sort: number;

  @ApiProperty({ description: '状态 0禁用 1启用', example: 1 })
  status: number;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date | string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date | string;

  @ApiProperty({ description: '子路由', type: [RouteResponseDto], required: false })
  children?: RouteResponseDto[];

  @ApiProperty({ description: '父路由', type: RouteResponseDto, required: false })
  parent?: RouteResponseDto;
}

/** 路由元信息响应包装 DTO */
export class RouteMetaResponseWrapperDto extends ApiResultWrapperDto<RouteMetaResponseDto> {
  @ApiProperty({ description: '响应数据', type: RouteMetaResponseDto })
  declare data: RouteMetaResponseDto;
}

/** 角色路由响应包装 DTO */
export class RoleRoutesResponseWrapperDto extends ApiResultWrapperDto<RoleRoutesResponseDto> {
  @ApiProperty({ description: '响应数据', type: RoleRoutesResponseDto })
  declare data: RoleRoutesResponseDto;
}

/** 路由信息响应包装 DTO */
export class RouteResponseWrapperDto extends ApiResultWrapperDto<RouteResponseDto> {
  @ApiProperty({ description: '响应数据', type: RouteResponseDto })
  declare data: RouteResponseDto;
}

/** 路由列表响应包装 DTO */
export class RouteListResponseWrapperDto extends ApiResultWrapperDto<RouteResponseDto[]> {
  @ApiProperty({ description: '响应数据', type: [RouteResponseDto] })
  declare data: RouteResponseDto[];
}

/** 角色路由列表响应包装 DTO */
export class RoleRoutesListResponseWrapperDto extends ApiResultWrapperDto<RoleRoutesResponseDto[]> {
  @ApiProperty({ description: '响应数据', type: [RoleRoutesResponseDto] })
  declare data: RoleRoutesResponseDto[];
}
