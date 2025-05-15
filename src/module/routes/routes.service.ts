import { Injectable } from "@nestjs/common";
import { CreateRouteDto, FindRouteDto, UpdateRouteDto } from "./dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Route } from "./entities/route.entity";
import { IsNull, Repository } from "typeorm";
import { BaseService } from "@/common/service/base";
import { ApiResult } from "@/common/utils/result";

@Injectable()
export class RoutesService extends BaseService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>
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
}
