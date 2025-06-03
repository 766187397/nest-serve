import { Injectable } from "@nestjs/common";
import { CreateRouteDto, FindRouteDto, UpdateRouteDto } from "./dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Route } from "./entities/route.entity";
import { In, IsNull, Repository } from "typeorm";
import { BaseService } from "@/common/service/base";
import { ApiResult } from "@/common/utils/result";
import { Role } from "@/module/roles/entities/role.entity";
import { RoleRoutes } from "@/types/routes";

@Injectable()
export class RoutesService extends BaseService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {
    super();
  }

  /**
   * 创建路由
   * @param {CreateRouteDto} createRouteDto 路由信息
   * @returns { ApiResult<null>>} 统一返回结果
   */
  async create(createRouteDto: CreateRouteDto): Promise<ApiResult<null>> {
    try {
      let parent: Route | null = null;
      if (createRouteDto.parentId) {
        parent = await this.routeRepository.findOne({
          where: { id: createRouteDto.parentId, platform: createRouteDto.platform },
          relations: ["children"],
        });
        if (!parent) {
          return ApiResult.error<null>("父级路由不存在");
        }
      }
      const routeInfo = await this.routeRepository.findOne({
        where: { name: createRouteDto.name, platform: createRouteDto.platform },
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
   * @returns {Promise<ApiResult<Route[] | null>>} 统一返回结果
   */
  async findAll(findRouteDto: FindRouteDto): Promise<ApiResult<Route[] | null>> {
    try {
      console.log("findRouteDto.platform", findRouteDto.platform);
      let order = this.buildCommonSort(findRouteDto?.sort);
      let data = await this.routeRepository.find({
        where: { parent: IsNull(), platform: findRouteDto.platform },
        order: { ...order },
        relations: ["children"],
      });
      return ApiResult.success<Route[]>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "路由查询失败，请稍后再试");
    }
  }

  /**
   * 通过id查询详情
   * @param {number} id 路由的id
   * @returns
   */
  async findOne(id: number): Promise<ApiResult<Route | null>> {
    try {
      let data = await this.routeRepository.findOne({
        where: { id },
        relations: ["children", "parent"],
      });
      return ApiResult.success<Route>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "路由查询失败，请稍后再试");
    }
  }

  /**
   * 路由信息修改
   * @param {number} id 路由id
   * @param {UpdateRouteDto} updateRouteDto 路由信息
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async update(id: number, updateRouteDto: UpdateRouteDto): Promise<ApiResult<null>> {
    try {
      // 查询当前路由是否存在
      let route = await this.routeRepository.findOne({
        where: { id },
        relations: ["children", "parent"],
      });
      if (!route) {
        return ApiResult.error("路由不存在");
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
   * @param {number} id 路由id
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async remove(id: number): Promise<ApiResult<null>> {
    try {
      await this.routeRepository.softDelete(id);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>(error || "路由删除失败，请稍后再试");
    }
  }

  /**
   * 通过角色存在，则返回角色下的所有路由信息
   * @param {number[]} rolesIds 角色ID数组
   * @param {string} platform 平台标识
   * @param {string} type 路由类型
   * @returns {Promise<ApiResult<RoleRoutes[] | null>>} 统一返回结果
   */
  async getRoutesByRoleId(
    rolesIds: number[],
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
      const queryBuilderRoute = this.routeRepository
        .createQueryBuilder("route")
        // 关联查询子节点（核心过滤逻辑）
        .leftJoinAndSelect(
          "route.children", // 关联字段路径（父实体的 children 属性）
          "child", // 子表别名（自定义）
          "child.id  IN (:...routeIds)", // 子节点过滤条件（SQL条件片段）
          { routeIds } // 参数注入（防SQL注入）
        )
        // WHERE 主表条件组合
        .where({
          id: In(routeIds), // 主表ID在 routeIds 中
          parent: IsNull(), // 主表的 parent 为空（查根节点）
          platform, // 平台条件（变量值自动绑定）
        })
        // 排序
        .orderBy({
          "route.sort": "DESC",
          "child.sort": "DESC",
          "route.createdAt": "DESC",
          "child.createdAt": "DESC",
        });
      if (type) {
        queryBuilderRoute.andWhere("route.type = :type", { type });
      }
      const data = await queryBuilderRoute.getMany();
      const routeList = this.handleRoutes(data);
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
