import { Injectable } from "@nestjs/common";
import { CreateUserDto, FindUserDto, UpdateUserDto } from "./dto/index";
import { ApiResult } from "@/common/utils/result";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { BaseService } from "@/common/service/base";

@Injectable()
export class UsersService extends BaseService {
  constructor(
    @InjectRepository(User) // NestJS 会根据这个装饰器将 UserRepository 自动注入到 userRepository 变量中。
    private userRepository: Repository<User> // 这是一个 TypeORM 提供的 Repository 对象，封装了对 User 实体的所有数据库操作方法
  ) {
    super();
  }

  /**
   * 创建用户
   * @param {CreateUserDto} createUserDto  创建用户DTO
   * @returns {Promise<ApiResult<any>>} 统一返回结果
   */
  async create(createUserDto: CreateUserDto): Promise<ApiResult<any>> {
    try {
      // 查询数据库，确保 userName, phone, email 不存在
      const { userName = null, phone = null, email = null } = createUserDto;

      // 构建查询条件
      const queryBuilder = this.userRepository.createQueryBuilder("user");
      userName && queryBuilder.andWhere("user.userName = :userName", { userName });
      phone && queryBuilder.orWhere("user.phone = :phone", { phone });
      email && queryBuilder.orWhere("user.email = :email", { email });
      // 执行查询
      const existingUser = await queryBuilder.getOne();
      // 如果查询结果存在，返回错误
      if (existingUser) {
        return ApiResult.error<string>("用户名、电话号码或邮箱已存在");
      }
      // createUserDto.password = CryptoUtil.encrypt(createUserDto.password as string);
      const user = this.userRepository.create(createUserDto); // 创建 User 实体
      // if (roleIds.length > 0) {
      //   user.roles = await this.roleRepository.find({ where: { id: In(roleIds) } });
      // }
      let data = await this.userRepository.save(user); // 保存到数据库并返回
      return ApiResult.success({ data });
    } catch (error) {
      return ApiResult.error<any>(error);
    }
  }

  async findAll(findUserDto?: FindUserDto): Promise<ApiResult<any>> {
    try {
      let where = this.buildCommonQuery(findUserDto);
      let order = this.buildCommonSort(findUserDto);
      let data = await this.userRepository.find({
        where: {
          ...where,
        },
        order: {
          ...order,
        },
      }); // 查询所有用户并返回;
      return ApiResult.success({ data });
    } catch (error) {
      return ApiResult.error(error || "用户查询失败，请稍后再试");
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
