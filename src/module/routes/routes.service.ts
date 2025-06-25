import { Injectable } from "@nestjs/common";
import { CreateRouteDto, FindRouteDto, UpdateRouteDto } from "./dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Route } from "./entities/route.entity";
import { In, IsNull, Not, Repository, TreeRepository } from "typeorm";
import { BaseService } from "@/common/service/base";
import { ApiResult } from "@/common/utils/result";
import { Role } from "@/module/roles/entities/role.entity";
import { RoleRoutes, RouteInfo } from "@/types/routes";

@Injectable()
export class RoutesService extends BaseService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(Route)
    private readonly treeRouteRepository: TreeRepository<Route>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {
    super();
  }

  /**
   * 创建路由
   * @param {CreateRouteDto} createRouteDto 路由信息
   * @param {string} platform 路由信息
   * @returns { ApiResult<null> } 统一返回结果
   */
  async create(createRouteDto: CreateRouteDto, platform: string = "admin"): Promise<ApiResult<null>> {
    try {
      let parent: Route | null = null;
      if (createRouteDto.parentId) {
        parent = await this.routeRepository.findOne({
          where: { id: createRouteDto.parentId, platform },
          relations: ["children"],
        });
        if (!parent) {
          return ApiResult.error<null>("父级路由不存在");
        }
      }
      const routeInfo = await this.routeRepository.findOne({
        where: { name: createRouteDto.name, platform },
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
      return ApiResult.error<null>(error || "路由创建失败，请稍后再试");
    }
  }

  /**
   * 查询所有路由
   * @param {FindRouteDto} findRouteDto 查询条件
   * @param {string} platform 平台标识（如admin/web/app/mini等）
   * @returns {Promise<ApiResult<Route[] | null>>} 统一返回结果
   */
  async findAll(findRouteDto: FindRouteDto, platform: string = "admin"): Promise<ApiResult<Route[] | null>> {
    try {
      let order = this.buildCommonSort(findRouteDto?.sort);
      let data = await this.routeRepository.find({
        where: {
          platform,
          type: findRouteDto.type,
        },
        order: { ...order },
        relations: ["parent"],
      });
      let trees = this.buildTree(data);

      return ApiResult.success<Route[]>({ data: trees });
    } catch (error) {
      return ApiResult.error<null>(error || "路由查询失败，请稍后再试");
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
   * @returns
   */
  async findOne(id: string): Promise<ApiResult<Route | null>> {
    try {
      let data: RouteInfo = await this.routeRepository.findOne({
        where: { id },
        relations: ["children", "parent"],
      });
      if (data && data.parent) {
        data.parentId = data.parent.id;
      }
      return ApiResult.success<Route>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "路由查询失败，请稍后再试");
    }
  }

  /**
   * 路由信息修改
   * @param {string} id 路由id
   * @param {UpdateRouteDto} updateRouteDto 路由信息
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async update(id: string, updateRouteDto: UpdateRouteDto): Promise<ApiResult<null>> {
    try {
      // 查询当前路由是否存在
      const route = await this.routeRepository.findOne({
        where: { id },
        relations: ["children", "parent"],
      });
      if (!route) {
        return ApiResult.error("路由不存在");
      }

      const exist = await this.routeRepository.findOne({
        where: { id: Not(id), name: route.name },
      });
      if (exist) {
        return ApiResult.error<null>(`路由${exist.name}已存在`);
      }

      // 如果有新的 parent，查询对应的父级路由
      if (updateRouteDto.parentId) {
        if (updateRouteDto.parentId == route.id) {
          return ApiResult.error("父级路由不能为当前路由");
        }
        const parentRoute = await this.routeRepository.findOne({
          where: { id: updateRouteDto.parentId, platform: updateRouteDto.platform },
        });
        if (!parentRoute) {
          return ApiResult.error("父级路由不存在");
        }
        route.parent = parentRoute || null; // 如果 parent 为 null，则设置为 null
      }

      // 更新其他字段
      Object.assign(route, {
        ...updateRouteDto,
        parent: route.parent, // 确保 parent 类型一致
      });

      // 保存更新后的路由
      await this.routeRepository.save(route);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>(error || "路由更新失败，请稍后再试");
    }
  }

  /**
   * 删除路由信息
   * @param {string} id 路由id
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async remove(id: string): Promise<ApiResult<null>> {
    try {
      await this.routeRepository.softDelete(id);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>(error || "路由删除失败，请稍后再试");
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
    platform: string = "admin",
    type?: string
  ): Promise<ApiResult<RoleRoutes[] | null>> {
    try {
      if (rolesIds.length === 0) {
        return ApiResult.error<null>("当前用户未绑定角色，无法获取绑定的路由信息！");
      }
      const queryBuilderRole = this.roleRepository
        .createQueryBuilder("role")
        .select("route.id", "routeId")
        .leftJoin("role.routes", "route")
        .where("role.id  IN (:...ids)", { ids: rolesIds })
        .groupBy("route.id");

      const routeIds = (await queryBuilderRole.getRawMany()).map((item) => item.routeId);
      // 没有绑定路由
      if (routeIds.length === 0) {
        return ApiResult.success<RoleRoutes[]>({ data: [] }); // 无权限
      }

      let order = this.buildCommonSort();
      // 2. 获取顶层路由节点
      const rootRoutes = await this.routeRepository.find({
        where: {
          id: In(routeIds),
          platform,
          type,
        },
        order: { ...order },
        relations: ["parent"],
      });

      // // 3. 对每个根节点查询完整子树（使用 findDescendantsTree）
      // const trees = await Promise.all(rootRoutes.map((route) => this.treeRouteRepository.findDescendantsTree(route)));

      const trees = this.buildTree(rootRoutes);

      // 4. 你已有的格式化函数
      const routeList = this.handleRoutes(trees);

      return ApiResult.success<RoleRoutes[]>({ data: routeList });
    } catch (error) {
      return ApiResult.error<null>(error || "获取路由失败，请稍后再试");
    }
  }

  private handleRoutes(routes: Route[] | RoleRoutes[]): RoleRoutes[] {
    return routes.map((route: Route | RoleRoutes) => {
      if (route.children) {
        route.children = this.handleRoutes(route.children);
      }
      let meta: any = {};
      try {
        meta = JSON.parse(route.meta as string);
      } catch (error) {
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
