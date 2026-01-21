import { ApiProperty } from '@nestjs/swagger';

/** 路由元信息DTO */
export class RouteMetaDto {
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
export class RoleRoutesDto {
  @ApiProperty({ description: '路由路径', example: '/users' })
  path: string;

  @ApiProperty({ description: '路由名称', example: 'UserManagement' })
  name: string;

  @ApiProperty({ description: '组件路径', example: '@/views/users/index.vue' })
  component: string;

  @ApiProperty({ description: '路由元信息', type: RouteMetaDto })
  meta: RouteMetaDto;

  @ApiProperty({ description: '子路由', type: [RoleRoutesDto], required: false })
  children?: RoleRoutesDto[];
}