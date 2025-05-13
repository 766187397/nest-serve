import { Injectable } from "@nestjs/common";
import { CreateRoleDto, FindRoleDto, FindRoleDtoByPage, UpdateRoleDto } from "./dto";
import { BaseService } from "@/common/service/base";
import { Role } from "./entities/role.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, ILike, Repository } from "typeorm";
import { ApiResult } from "@/common/utils/result";

@Injectable()
export class RolesService extends BaseService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {
    super();
  }
  /**
   * 创建角色
   * @param {CreateRoleDto} createRoleDto 角色信息
   * @param {string} platform 平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<Role> | ApiResult<string>>} 统一返回结果
   */
  async create(createRoleDto: CreateRoleDto, platform: string = "admin"): Promise<ApiResult<Role> | ApiResult<string>> {
    try {
      let { name, roleKey } = createRoleDto;
      // 构建查询条件
      const queryBuilder = this.roleRepository.createQueryBuilder("user");
      queryBuilder.andWhere("user.platform = :platform", { platform });
      if (name || roleKey) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            if (name) qb.where("user.name = :name", { name });
            if (roleKey) qb.orWhere("user.roleKey = :roleKey", { roleKey });
          })
        );
      }
      // 执行查询
      const existingUser = await queryBuilder.getOne();
      // 如果查询结果存在，返回错误
      if (existingUser) {
        return ApiResult.error<string>("角色名称或角色标识已存在");
      }
      const role = this.roleRepository.create(createRoleDto);
      role.platform = platform; // 指定平台

      let data = await this.roleRepository.save(role); // 保存到数据库并返回
      return ApiResult.success<Role>({ data });
    } catch (error) {
      return ApiResult.error<any>(error);
    }
  }

  /**
   * 分页查询
   * @param {FindRoleDtoByPage} findRoleDtoByPage 查询条件
   * @param {string} platform 平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<Role> | ApiResult<string>>} 统一返回结果
   */
  async findByPage(findRoleDtoByPage: FindRoleDtoByPage, platform: string = "admin") {
    try {
      let { take, skip } = this.buildCommonPaging(findRoleDtoByPage?.page, findRoleDtoByPage?.pageSize);
      let where = this.buildCommonQuery(findRoleDtoByPage);
      let order = this.buildCommonSort(findRoleDtoByPage);
      // 查询符合条件的用户
      const [data, total] = await this.roleRepository.findAndCount({
        where: {
          ...where,
          platform: platform,
          name: findRoleDtoByPage?.name ? ILike(`%${findRoleDtoByPage.name}%`) : undefined,
          roleKey: findRoleDtoByPage?.roleKey,
          value: findRoleDtoByPage?.value,
        },
        order: {
          ...order,
        },
        skip, // 跳过的条数
        take, // 每页条数
      });

      // 计算总页数
      const totalPages = Math.ceil(total / take);
      return ApiResult.success({
        data: {
          data,
          total,
          totalPages,
          page: findRoleDtoByPage?.page || 1,
          pageSize: findRoleDtoByPage?.pageSize || 10,
        },
      });
    } catch (error) {}
  }

  findAll(findRoleDto: FindRoleDto, platform: string = "admin") {
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
