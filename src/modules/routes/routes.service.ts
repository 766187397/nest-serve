import { Injectable } from '@nestjs/common';
import { CreateRouteDto, FindRouteDto, UpdateRouteDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { In, Not, Repository, TreeRepository, FindOperator } from 'typeorm';
import { buildCommonSort } from '@/common/utils/service.util';
import { ApiResult } from '@/common/utils/result';
import { Role } from '@/modules/roles/entities/role.entity';
import { RoleRoutes, RouteInfo } from '@/types/routes';
import { handlePlatformQuery } from '@/common/utils/query.util';

interface RouteMeta {
  title?: string;
  icon?: string;
  externalLinks?: boolean;
  type?: string;
  status?: boolean;
  [key: string]: unknown;
}

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(Route)
    private readonly treeRouteRepository: TreeRepository<Route>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {}

  /**
   * 创建路由
   * @param {CreateRouteDto} createRouteDto 路由信息
   * @param {string} platform 路由信息
   * @returns { ApiResult<null> } 统一返回结果
   */
  async create(
    createRouteDto: CreateRouteDto,
    platform: string = 'admin'
  ): Promise<ApiResult<null>> {
    try {
      let parent: Route | null = null;
      if (createRouteDto.parentId) {
        parent = await this.routeRepository.findOne({
          where: {
            id: createRouteDto.parentId,
            platform: handlePlatformQuery(platform, undefined),
          },
          relations: ['children'],
        });
        if (!parent) {
          return ApiResult.error<null>('父级路由不存在');
        }
      }
      const routeInfo = await this.routeRepository.findOne({
        where: { name: createRouteDto.name, platform: handlePlatformQuery(platform, undefined) },
      });
      if (routeInfo) {
        return ApiResult.error<null>(`路由${routeInfo.name}已存在`);
      }
      const route = this.routeRepository.create({
        ...createRouteDto,
        parent: parent || undefined,
      });
      await this.routeRepository.save(route);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '路由创建失败，请稍后再试');
    }
  }

  /**
   * 查询所有路由
   * @param {FindRouteDto} findRouteDto 查询条件
   * @param {string} platform 平台标识（如admin/web/app/mini等）
   * @returns {Promise<ApiResult<Route[] | null>>} 统一返回结果
   */
  async findAll(
    findRouteDto: FindRouteDto,
    platform: string = 'admin'
  ): Promise<ApiResult<Route[] | null>> {
    try {
      const order = buildCommonSort(findRouteDto?.sort);
      const data = await this.routeRepository.find({
        where: {
          platform: handlePlatformQuery(platform, findRouteDto?.platform),
          type: findRouteDto.type,
        },
        order: { ...order },
        relations: ['parent'],
      });
      const trees = this.buildTree(data);

      return ApiResult.success<Route[]>({ data: trees });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '路由查询失败，请稍后再试');
    }
  }

  /**
   * 构造树形结构
   * @param nodes 路由列表
   * @returns  {Route[]} 树形结构
   */
  buildTree(nodes: Route[]): Route[] {
    const nodeMap = new Map<string, Route>();
    const roots: Route[] = [];

    for (const node of nodes) {
      node.children = [];
      nodeMap.set(node.id, node);
    }

    for (const node of nodes) {
      const parentId = node.parent?.id;
      if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * 通过id查询详情
   * @param {string} id 路由的id
   * @param {string} platform 请求头中的平台标识
   * @returns
   */
  async findOne(id: string, platform?: string): Promise<ApiResult<Route | null>> {
    try {
      const finalPlatform = handlePlatformQuery(platform, undefined, true);
      const whereCondition: { id: string; platform?: string | FindOperator<string> } = { id };
      if (finalPlatform !== undefined) {
        whereCondition.platform = finalPlatform;
      }
      const data: RouteInfo = await this.routeRepository.findOne({
        where: whereCondition,
        relations: ['children', 'parent'],
      });
      if (data && data.parent) {
        data.parentId = data.parent.id;
      }
      return ApiResult.success<Route>({ data });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '路由查询失败，请稍后再试');
    }
  }

  /**
   * 路由信息修改
   * @param {string} id 路由id
   * @param {UpdateRouteDto} updateRouteDto 路由信息
   * @param {string} platform 请求头中的平台标识
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async update(id: string, updateRouteDto: UpdateRouteDto, platform?: string): Promise<ApiResult<null>> {
    try {
      const finalPlatform = handlePlatformQuery(platform, undefined, true);
      const whereCondition: { id: string; platform?: string | FindOperator<string> } = { id };
      if (finalPlatform !== undefined) {
        whereCondition.platform = finalPlatform;
      }
      const route = await this.routeRepository.findOne({
        where: whereCondition,
        relations: ['children', 'parent'],
      });
      if (!route) {
        return ApiResult.error('路由不存在');
      }
      const existWhere: { id: FindOperator<string>; name: string; platform?: string | FindOperator<string> } = { 
        id: Not(id), 
        name: route.name 
      };
      if (finalPlatform !== undefined) {
        existWhere.platform = finalPlatform;
      }
      const exist = await this.routeRepository.findOne({
        where: existWhere,
      });
      if (exist) {
        return ApiResult.error<null>(`路由${exist.name}已存在`);
      }

      if (updateRouteDto.parentId) {
        if (updateRouteDto.parentId == route.id) {
          return ApiResult.error('父级路由不能为当前路由');
        }
        const parentWhere: { id: string; platform?: string | FindOperator<string> } = {
          id: updateRouteDto.parentId,
        };
        if (finalPlatform !== undefined) {
          parentWhere.platform = finalPlatform;
        }
        const parentRoute = await this.routeRepository.findOne({
          where: parentWhere,
        });
        if (!parentRoute) {
          return ApiResult.error('父级路由不存在');
        }
        route.parent = parentRoute || null;
      }

      Object.assign(route, {
        ...updateRouteDto,
        parent: route.parent,
      });

      await this.routeRepository.save(route);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '路由更新失败，请稍后再试');
    }
  }

  async remove(id: string, platform?: string): Promise<ApiResult<null>> {
    try {
      const finalPlatform = handlePlatformQuery(platform, undefined, true);
      const deleteCondition: { id: string; platform?: string | FindOperator<string> } = { id };
      if (finalPlatform !== undefined) {
        deleteCondition.platform = finalPlatform;
      }
      await this.routeRepository.softDelete(deleteCondition);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '路由删除失败，请稍后再试');
    }
  }

  /**
   * 通过角色存在，则返回角色下的所有路由信息
   * @param {string[]} rolesIds 角色ID数组
   * @param {string} platform 平台标识
   * @param {string} type 路由类型
   * @returns {Promise<ApiResult<RoleRoutes[] | null>>} 统一返回结果
   */
  async getRoutesByRoleId(
    rolesIds: string[],
    platform: string = 'admin',
    type?: string
  ): Promise<ApiResult<RoleRoutes[] | null>> {
    try {
      if (rolesIds.length === 0) {
        return ApiResult.error<null>('当前用户未绑定角色，无法获取绑定的路由信息！');
      }
      const queryBuilderRole = this.roleRepository
        .createQueryBuilder('role')
        .select('route.id', 'routeId')
        .leftJoin('role.routes', 'route')
        .where('role.id  IN (:...ids)', { ids: rolesIds })
        .groupBy('route.id');

      const routeIds = (await queryBuilderRole.getRawMany()).map(
        (item: { routeId: string }) => item.routeId
      );
      // 没有绑定路由
      if (routeIds.length === 0) {
        return ApiResult.success<RoleRoutes[]>({ data: [] }); // 无权限
      }

      const order = buildCommonSort();
      // 2. 获取顶层路由节点
      const rootRoutes = await this.routeRepository.find({
        where: {
          id: In(routeIds),
          platform: handlePlatformQuery(platform, undefined),
          type,
        },
        order: { ...order },
        relations: ['parent'],
      });

      // // 3. 对每个根节点查询完整子树（使用 findDescendantsTree）
      // const trees = await Promise.all(rootRoutes.map((route) => this.treeRouteRepository.findDescendantsTree(route)));

      const trees = this.buildTree(rootRoutes);

      // 4. 你已有的格式化函数
      const routeList = this.handleRoutes(trees);

      return ApiResult.success<RoleRoutes[]>({ data: routeList });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '获取路由失败，请稍后再试');
    }
  }

  private handleRoutes(routes: Route[] | RoleRoutes[]): RoleRoutes[] {
    return routes.map((route: Route | RoleRoutes) => {
      if (route.children) {
        route.children = this.handleRoutes(route.children);
      }
      let meta: RouteMeta = {};
      try {
        meta = JSON.parse(route.meta as string) as RouteMeta;
      } catch {
        meta = {};
      }
      return {
        path: route.path,
        name: route.name,
        component: route.component,
        redirect: (route as Route).redirect,
        meta: {
          ...meta,
          title: (route as Route).title,
          icon: (route as Route).icon,
          externalLinks: (route as Route).externalLinks,
          type: (route as Route).type,
          status: (route as Route).status,
        },
        children: route.children || [],
      };
    });
  }
}
