import { Injectable } from "@nestjs/common";
import { CreateRoleDto, FindRoleDto, FindRoleDtoByPage, UpdateRoleDto } from "./dto";
import { BaseService } from "@/common/service/base";
import { Role } from "./entities/role.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, ILike, In, Not, Repository, UpdateResult } from "typeorm";
import { ApiResult } from "@/common/utils/result";
import { PageApiResult } from "@/types/public";
import { Route } from "@/module/routes/entities/route.entity";

@Injectable()
export class RolesService extends BaseService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(Route)
    private routeRepository: Repository<Route>
  ) {
    super();
  }
  /**
   * 创建角色
   * @param {CreateRoleDto} createRoleDto 角色信息
   * @param {string} platform 平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<Role | null>>} 统一返回结果
   */
  async create(createRoleDto: CreateRoleDto, platform: string = "admin"): Promise<ApiResult<Role | null>> {
    try {
      let { name, roleKey } = createRoleDto;
      // 构建查询条件
      const queryBuilder = this.roleRepository.createQueryBuilder("role");
      queryBuilder.andWhere("role.platform = :platform", { platform });
      if (name || roleKey) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            if (name) qb.where("role.name = :name", { name });
            if (roleKey) qb.orWhere("role.roleKey = :roleKey", { roleKey });
          })
        );
      }
      // 执行查询
      const existingRole = await queryBuilder.getOne();
      // 如果查询结果存在，返回错误
      if (existingRole) {
        return ApiResult.error<null>("角色名称或角色标识已存在");
      }
      const role = this.roleRepository.create(createRoleDto);
      role.platform = platform; // 指定平台

      let data = await this.roleRepository.save(role); // 保存到数据库并返回
      return ApiResult.success<Role>({ data });
    } catch (error) {
      const errorMessage = typeof error === "string" ? error : JSON.stringify(error);
      return ApiResult.error<any>(errorMessage || "创建角色失败，请稍后重试");
    }
  }

  /**
   * 分页查询
   * @param {FindRoleDtoByPage} findRoleDtoByPage 查询条件
   * @param {string} platform 平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<PageApiResult<Role[]> | null>>} 统一返回结果
   */
  async findByPage(
    findRoleDtoByPage: FindRoleDtoByPage,
    platform: string = "admin"
  ): Promise<ApiResult<PageApiResult<Role[]> | null>> {
    try {
      let { take, skip } = this.buildCommonPaging(findRoleDtoByPage?.page, findRoleDtoByPage?.pageSize);
      let where = this.buildCommonQuery(findRoleDtoByPage);
      let order = this.buildCommonSort(findRoleDtoByPage?.sort);
      // 查询符合条件的用户
      const [data, total] = await this.roleRepository.findAndCount({
        where: {
          ...where,
          platform: platform,
          name: findRoleDtoByPage?.name ? ILike(`%${findRoleDtoByPage.name}%`) : undefined,
          roleKey: findRoleDtoByPage?.roleKey,
        },
        order: {
          ...order,
        },
        skip, // 跳过的条数
        take, // 每页条数
      });

      // 计算总页数
      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<Role[]>>({
        data: {
          data,
          total,
          totalPages,
          page: findRoleDtoByPage?.page || 1,
          pageSize: findRoleDtoByPage?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error<null>(error || "查询角色失败，请稍后重试");
    }
  }

  /**
   * 查询所有角色
   * @param {FindRoleDto} findRoleDto 查询条件
   * @param {string} platform 平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<Role[] | null>>} 统一返回结果
   */
  async findAll(findRoleDto: FindRoleDto, platform: string = "admin"): Promise<ApiResult<Role[] | null>> {
    try {
      let where = this.buildCommonQuery(findRoleDto);
      let order = this.buildCommonSort(findRoleDto?.sort);
      let data = await this.roleRepository.find({
        where: {
          ...where,
          platform,
          name: findRoleDto?.name ? ILike(`%${findRoleDto.name}%`) : undefined,
          roleKey: findRoleDto?.roleKey,
        },
        order: {
          ...order,
        },
      }); // 查询所有用户并返回;
      return ApiResult.success<Role[]>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "查询角色失败，请稍后重试");
    }
  }

  /**
   * 通过id查询角色
   * @param {string} id 角色ID
   * @param {string} platform 平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<Role | null>>} 统一返回结果
   */
  async findOne(id: string, platform: string = "admin"): Promise<ApiResult<Role | null>> {
    try {
      let data = await this.roleRepository.findOne({
        where: { id, platform },
        relations: ["routes"],
      });
      if (!data) {
        return ApiResult.error<null>("角色不存在");
      }
      return ApiResult.success<Role>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "查询角色失败，请稍后重试");
    }
  }

  /**
   * 更新角色
   * @param {string} id 角色ID
   * @param {UpdateRoleDto} updateRoleDto 更新角色信息
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<ApiResult<null>> {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        return ApiResult.error("角色不存在");
      }

      const exist = await this.roleRepository.find({
        where: [
          { id: Not(id), name: role.name },
          { id: Not(id), roleKey: role.roleKey },
        ],
      });
      if (exist && exist.length > 0) {
        return ApiResult.error("角色名称或角色标识已存在");
      }

      // role = { ...role, ...updateRoleDto };
      Object.assign(role, updateRoleDto);
      if (updateRoleDto.routeIds) {
        role.routes = await this.routeRepository.find({ where: { id: In(updateRoleDto.routeIds) } });
      }
      await this.roleRepository.save(role);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>(error || "角色更新失败，请稍后再试");
    }
  }

  /**
   * 删除角色
   * @param {string} id 角色ID
   * @returns {Promise<ApiResult<UpdateResult | null>>} 统一返回结果
   */
  async remove(id: string): Promise<ApiResult<UpdateResult | null>> {
    try {
      let data = await this.roleRepository.softDelete(id);
      return ApiResult.success<UpdateResult>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "角色删除失败，请稍后再试");
    }
  }
}
