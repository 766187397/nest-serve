import { Injectable } from "@nestjs/common";
import { CreateUserDto, FindUserDto, FindUserDtoByPage, LogInDto, UpdateUserDto } from "./dto/index";
import { ApiResult } from "@/common/utils/result";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { BaseService } from "@/common/service/base";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UsersService extends BaseService {
  constructor(
    @InjectRepository(User) // NestJS 会根据这个装饰器将 UserRepository 自动注入到 userRepository 变量中。
    private userRepository: Repository<User>, // 这是一个 TypeORM 提供的 Repository 对象，封装了对 User 实体的所有数据库操作方法

    private readonly jwtService: JwtService, // JwtService 是 NestJS 提供的用于生成和验证 JWT 的服务
    private readonly configService: ConfigService
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

  /**
   * 分页查询
   * @param {FindUserDtoByPage} findUserDtoByPage 查询条件
   * @returns {Promise<ApiResult<any>>} 统一返回结果
   */
  async findByPage(findUserDtoByPage?: FindUserDtoByPage): Promise<ApiResult<any>> {
    try {
      let { take, skip } = this.buildCommonPaging(findUserDtoByPage?.page, findUserDtoByPage?.pageSize);
      let where = this.buildCommonQuery(findUserDtoByPage);
      let order = this.buildCommonSort(findUserDtoByPage);
      // 查询符合条件的用户
      const [data, total] = await this.userRepository.findAndCount({
        where: {
          ...where,
          userName: findUserDtoByPage?.userName,
          nickName: findUserDtoByPage?.nickName,
          email: findUserDtoByPage?.email,
          phone: findUserDtoByPage?.phone,
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
          page: findUserDtoByPage?.page || 1,
          pageSize: findUserDtoByPage?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error(error || "用户查询失败，请稍后再试");
    }
  }

  /**
   * 查询所有用户
   * @param {FindUserDto} findUserDto 查询条件
   * @returns {Promise<ApiResult<any>>} 统一返回结果
   */
  async findAll(findUserDto?: FindUserDto): Promise<ApiResult<any>> {
    try {
      let where = this.buildCommonQuery(findUserDto);
      let order = this.buildCommonSort(findUserDto);
      let data = await this.userRepository.find({
        where: {
          ...where,
          userName: findUserDto?.userName,
          nickName: findUserDto?.nickName,
          email: findUserDto?.email,
          phone: findUserDto?.phone,
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

  /**
   * 通过ID查询详情
   * @param {number} id
   * @returns {Promise<ApiResult<any>>} 统一返回结果
   */
  async findOne(id: number): Promise<ApiResult<any>> {
    try {
      let data = await this.userRepository.findOne({ where: { id } });
      return ApiResult.success({ data });
    } catch (error) {
      return ApiResult.error(error || "用户查询失败，请稍后再试");
    }
  }

  /**
   * 修改用户信息
   * @param {number} id 用户ID
   * @param updateUserDto 更新用户信息
   * @returns {Promise<ApiResult<any>>} 统一返回结果
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<ApiResult<any>> {
    try {
      let data = await this.userRepository.update(id, updateUserDto);
      return ApiResult.success({ data });
    } catch (error) {
      return ApiResult.error(error || "用户更新失败，请稍后再试");
    }
  }

  /**
   * 删除用户信息
   * @param {number} id 用户ID
   * @returns {Promise<ApiResult<any>>} 统一返回结果
   */
  async remove(id: number): Promise<ApiResult<any>> {
    try {
      let data = await this.userRepository.softDelete(id);
      return ApiResult.success({ data });
    } catch (error) {
      return ApiResult.error(error || "用户删除失败，请稍后再试");
    }
  }

  /**
   * 登录
   * @param {LogInDto} logInDto 登录参数
   * @returns {Promise<ApiResult<any>>} 统一返回结果
   */
  async logIn(logInDto: LogInDto): Promise<ApiResult<any>> {
    try {
      let data = await this.userRepository.findOne({
        where: { userName: logInDto.userName },
      });
      if (!data || data.password !== logInDto.password) {
        return ApiResult.error("用户名或密码错误");
      }
      // 这个状态需要自定义
      if (data.status === 2) {
        return ApiResult.error("当前账号已被禁用，请联系管理员！");
      }
      let { password, ...info } = data;
      let userInfo = {
        userInfo: info,
        token_type: "Bearer",
        access_token: this.jwtService.sign(info),
        refresh_token: this.jwtService.sign(
          { id: info.id },
          {
            expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN") + "d",
          }
        ),
      };
      return ApiResult.success({ data: userInfo });
    } catch (error) {
      return ApiResult.error(error || "用户登录失败，请稍后再试");
    }
  }
}
