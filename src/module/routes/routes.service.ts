import { Injectable } from "@nestjs/common";
import { CreateRouteDto, FindRouteDto, UpdateRouteDto } from "./dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Route } from "./entities/route.entity";
import { In, IsNull, Repository } from "typeorm";
import { BaseService } from "@/common/service/base";
import { ApiResult } from "@/common/utils/result";
import { Role } from "@/module/roles/entities/role.entity";

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
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns { ApiResult<null>>} 统一返回结果
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
      const route = this.routeRepository.create({
        ...createRouteDto,
        parentId: parent || undefined,
      });
      await this.routeRepository.save(route);
      return ApiResult.success<null>();
    } catch (error) {
      const errorMessage = typeof error === "string" ? error : JSON.stringify(error);
      return ApiResult.error<null>(errorMessage || "路由创建失败，请稍后再试");
    }
  }

  /**
   * 查询所有路由
   * @param {FindRouteDto} findRouteDto 查询条件
   * @returns {Promise<ApiResult<Route[]> | ApiResult<null>>} 统一返回结果
   */
  async findAll(findRouteDto: FindRouteDto): Promise<ApiResult<Route[]> | ApiResult<null>> {
    try {
      let order = this.buildCommonSort(findRouteDto);
      let data = await this.routeRepository.find({
        where: { parentId: IsNull(), platform: findRouteDto.platform },
        order: { ...order },
        relations: ["children"],
      });
      return ApiResult.success<Route[]>({ data });
    } catch (error) {
      const errorMessage = typeof error === "string" ? error : JSON.stringify(error);
      return ApiResult.error<null>(errorMessage || "路由查询失败，请稍后再试");
    }
  }

  /**
   * 通过id查询详情
   * @param {number} id 路由的id
   * @returns
   */
  async findOne(id: number): Promise<ApiResult<Route> | ApiResult<null>> {
    try {
      let data = await this.routeRepository.findOne({ where: { id } });
      return ApiResult.success<Route>({ data });
    } catch (error) {
      const errorMessage = typeof error === "string" ? error : JSON.stringify(error);
      return ApiResult.error<null>(errorMessage || "路由查询失败，请稍后再试");
    }
  }

  /**
   * 路由信息修改
   * @param {number} id 路由id
   * @param {UpdateRouteDto} updateRouteDto 路由信息
   * @returns {Promise<ApiResult<null> | ApiResult<null>>} 统一返回结果
   */
  async update(id: number, updateRouteDto: UpdateRouteDto): Promise<ApiResult<null> | ApiResult<null>> {
    try {
      // 查询当前路由是否存在
      let route = await this.routeRepository.findOne({
        where: { id },
        relations: ["children", "parentId"],
      });
      if (!route) {
        return ApiResult.error("路由不存在");
      }

      // 如果有新的 parentId，查询对应的父级路由
      if (updateRouteDto.parentId) {
        const parentRoute = await this.routeRepository.findOne({
          where: { id: updateRouteDto.parentId, platform: updateRouteDto.platform },
        });
        if (!parentRoute) {
          return ApiResult.error("父级路由不存在");
        }
        route.parentId = parentRoute || null; // 如果 parentId 为 null，则设置为 null
      }

      // 更新其他字段
      Object.assign(route, {
        ...updateRouteDto,
        parentId: route.parentId, // 确保 parentId 类型一致
      });

      // 保存更新后的路由
      await this.routeRepository.save(route);
      return ApiResult.success<null>();
    } catch (error) {
      const errorMessage = typeof error === "string" ? error : JSON.stringify(error);
      return ApiResult.error<null>(errorMessage || "路由更新失败，请稍后再试");
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
      const errorMessage = typeof error === "string" ? error : JSON.stringify(error);
      return ApiResult.error<null>(errorMessage || "路由删除失败，请稍后再试");
    }
  }

  /**
   * 通过角色存在，则返回角色下的所有路由信息
   * @param {number[]} rolesIds 角色ID数组
   * @param {string} platform 平台标识
   * @returns {Promise<ApiResult<Route[]> | ApiResult<null>>} 统一返回结果
   */
  async getRoutesByRoleId(
    rolesIds: number[],
    platform: string = "admin"
  ): Promise<ApiResult<Route[]> | ApiResult<null>> {
    try {
      let roles = await this.roleRepository.find({
        where: { id: In(rolesIds) },
        relations: ["routes"],
      });
      let routeIds: any = [];
      if (roles && roles.length > 0) {
        routeIds = roles.map((item) => {
          return item.routes.map((item) => {
            return item.id;
          });
        });
      }
      routeIds = [...new Set(routeIds.flat(Infinity))];
      let data = await this.routeRepository
        // 创建 QueryBuilder，别名设为 'parent'（主表）
        .createQueryBuilder("parent")
        // 关联查询子节点（核心过滤逻辑）
        .leftJoinAndSelect(
          "parent.children", // 关联字段路径（父实体的 children 属性）
          "child", // 子表别名（自定义）
          "child.id  IN (:...routeIds)", // 子节点过滤条件（SQL条件片段）
          { routeIds } // 参数注入（防SQL注入）
        )
        // WHERE 主表条件组合
        .where({
          id: In(routeIds), // 主表ID在 routeIds 中
          parentId: IsNull(), // 主表的 parentId 为空（查根节点）
          platform, // 平台条件（变量值自动绑定）
        })
        // 执行查询并返回实体对象数组
        .getMany();
      return ApiResult.success<Route[]>({ data });
    } catch (error) {
      const errorMessage = typeof error === "string" ? error : JSON.stringify(error);
      return ApiResult.error<null>(errorMessage || "获取路由失败，请稍后再试");
    }
  }
}
