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
      return ApiResult.error<null>(error || "路由查询失败，请稍后再试");
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} route`;
  }

  update(id: number, updateRouteDto: UpdateRouteDto) {
    return `This action updates a #${id} route`;
  }

  remove(id: number) {
    return `This action removes a #${id} route`;
  }
}
