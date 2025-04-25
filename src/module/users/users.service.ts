import { Injectable } from "@nestjs/common";
import { CreateUserDto, UpdateUserDto } from "./dto/index";
import { ApiResult } from "@/common/utils/result";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) // NestJS 会根据这个装饰器将 UserRepository 自动注入到 userRepository 变量中。
    private userRepository: Repository<User> // 这是一个 TypeORM 提供的 Repository 对象，封装了对 User 实体的所有数据库操作方法
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // 查询数据库，确保 userName, phoneNumber, email 不存在
      const { userName = null, phoneNumber = null, email = null } = createUserDto;

      // 构建查询条件
      const queryBuilder = this.userRepository.createQueryBuilder("user");
      userName && queryBuilder.andWhere("user.userName = :userName", { userName });
      phoneNumber && queryBuilder.orWhere("user.phoneNumber = :phoneNumber", { phoneNumber });
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

  findAll() {
    return `This action returns all users`;
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
