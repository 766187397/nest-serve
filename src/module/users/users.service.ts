import { Inject, Injectable } from "@nestjs/common";
import { CreateUserDto, FindUserDto, FindUserDtoByPage, LogInDto, UpdateUserDto } from "./dto/index";
import { ApiResult } from "@/common/utils/result";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Brackets, ILike, In, Repository, UpdateResult } from "typeorm";
import { BaseService } from "@/common/service/base";
import { JwtService } from "@nestjs/jwt";
import { bcryptService } from "@/common/utils/bcrypt-hash";
import { getPlatformJwtConfig, JwtConfig } from "@/config/jwt";
import { PageApiResult } from "@/types/public";
import { RefreshToken, UserLogin } from "@/types/user";
import { Role } from "@/module/roles/entities/role.entity";
import { Logger } from "winston";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

@Injectable()
export class UsersService extends BaseService {
  constructor(
    @InjectRepository(User) // NestJS 会根据这个装饰器将 UserRepository 自动注入到 userRepository 变量中。
    private userRepository: Repository<User>, // 这是一个 TypeORM 提供的 Repository 对象，封装了对 User 实体的所有数据库操作方法
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private readonly jwtService: JwtService, // JwtService 是 NestJS 提供的用于生成和验证 JWT 的服务
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
    super();
  }

  /**
   * 创建用户
   * @param {CreateUserDto} createUserDto  创建用户DTO
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<User> | ApiResult<null>>} 统一返回结果
   */
  async create(createUserDto: CreateUserDto, platform: string = "admin"): Promise<ApiResult<User> | ApiResult<null>> {
    try {
      // 查询数据库，确保 account, phone, email 不存在
      const { account = null, phone = null, email = null, roleIds = [] } = createUserDto;
      // 构建查询条件
      const queryBuilder = this.userRepository.createQueryBuilder("user");
      queryBuilder.andWhere("user.platform = :platform", { platform });
      if (account || phone || email) {
        // 使用Brackets，防止orWhere的优先级高于andWhere的platform 条件
        queryBuilder.andWhere(
          new Brackets((qb) => {
            if (account) qb.where("user.account = :account", { account });
            if (phone) qb.orWhere("user.phone = :phone", { phone });
            if (email) qb.orWhere("user.email = :email", { email });
          })
        );
      }
      // 执行查询
      const existingUser = await queryBuilder.getOne();
      // 如果查询结果存在，返回错误
      if (existingUser) {
        return ApiResult.error<null>("账号、电话号码或邮箱已存在");
      }
      createUserDto.password = await bcryptService.encryptStr(createUserDto.password as string);
      const user = this.userRepository.create(createUserDto); // 创建 User 实体
      user.platform = platform; // 指定平台
      if (roleIds.length > 0) {
        user.roles = await this.roleRepository.find({ where: { id: In(roleIds) } });
      }
      let data = await this.userRepository.save(user); // 保存到数据库并返回
      return ApiResult.success<User>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "用户创建失败，请稍后再试");
    }
  }

  /**
   * 分页查询
   * @param {FindUserDtoByPage} findUserDtoByPage 查询条件
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<null> | ApiResult<PageApiResult<User[]>>>} 统一返回结果
   */
  async findByPage(
    findUserDtoByPage?: FindUserDtoByPage,
    platform: string = "admin"
  ): Promise<ApiResult<null> | ApiResult<PageApiResult<User[]>>> {
    try {
      let { take, skip } = this.buildCommonPaging(findUserDtoByPage?.page, findUserDtoByPage?.pageSize);
      let where = this.buildCommonQuery(findUserDtoByPage);
      let order = this.buildCommonSort(findUserDtoByPage);
      // 查询符合条件的用户
      const [data, total] = await this.userRepository.findAndCount({
        where: {
          ...where,
          platform: platform,
          account: findUserDtoByPage?.account ? ILike(`%${findUserDtoByPage.account}%`) : undefined,
          nickName: findUserDtoByPage?.nickName ? ILike(`%${findUserDtoByPage.nickName}%`) : undefined,
          email: findUserDtoByPage?.email ? ILike(`%${findUserDtoByPage.email}%`) : undefined,
          phone: findUserDtoByPage?.phone ? ILike(`%${findUserDtoByPage.phone}%`) : undefined,
        },
        order: {
          ...order,
        },
        skip, // 跳过的条数
        take, // 每页条数
      });

      // 计算总页数
      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<User[]>>({
        data: {
          data,
          total,
          totalPages,
          page: findUserDtoByPage?.page || 1,
          pageSize: findUserDtoByPage?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error<null>(error || "用户查询失败，请稍后再试");
    }
  }

  /**
   * 查询所有用户
   * @param {FindUserDto} findUserDto 查询条件
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<User[]> | ApiResult<null>>} 统一返回结果
   */
  async findAll(findUserDto?: FindUserDto, platform: string = "admin"): Promise<ApiResult<User[]> | ApiResult<null>> {
    try {
      let where = this.buildCommonQuery(findUserDto);
      let order = this.buildCommonSort(findUserDto);
      let data = await this.userRepository.find({
        where: {
          ...where,
          platform,
          account: findUserDto?.account ? ILike(`%${findUserDto.account}%`) : undefined,
          nickName: findUserDto?.nickName ? ILike(`%${findUserDto.nickName}%`) : undefined,
          email: findUserDto?.email ? ILike(`%${findUserDto.email}%`) : undefined,
          phone: findUserDto?.phone ? ILike(`%${findUserDto.phone}%`) : undefined,
        },
        order: {
          ...order,
        },
      }); // 查询所有用户并返回;
      return ApiResult.success<User[]>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "用户查询失败，请稍后再试");
    }
  }

  /**
   * 通过ID查询详情
   * @param {number} id
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<User> | ApiResult<null>>} 统一返回结果
   */
  async findOne(id: number, platform: string = "admin"): Promise<ApiResult<User> | ApiResult<null>> {
    try {
      let data = await this.userRepository.findOne({ where: { id, platform } });
      if (!data) {
        return ApiResult.error<null>("用户不存在");
      }
      return ApiResult.success<User>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "用户查询失败，请稍后再试");
    }
  }

  /**
   * 修改用户信息
   * @param {number} id 用户ID
   * @param updateUserDto 更新用户信息
   * @returns {Promise<ApiResult<User> | ApiResult<null>>} 统一返回结果
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<ApiResult<User> | ApiResult<null>> {
    try {
      // 查询用户
      let userInfo = await this.userRepository.findOne({
        where: { id },
        relations: ["roles"],
      });
      if (!userInfo) {
        return ApiResult.error("用户不存在");
      }
      userInfo = { ...userInfo, ...updateUserDto };
      // 查询角色
      if (updateUserDto.roleIds && updateUserDto.roleIds.length > 0) {
        const roles = await this.roleRepository.find({
          where: { id: In(updateUserDto.roleIds) },
        });
        userInfo.roles = roles;
      } else if (updateUserDto.roleIds && updateUserDto.roleIds.length === 0) {
        userInfo.roles = [];
      }

      // 修改密码加密
      if (updateUserDto.password) {
        userInfo.password = await bcryptService.encryptStr(updateUserDto.password as string);
      }

      // 重新设置信息
      let data = await this.userRepository.save(userInfo);
      return ApiResult.success<User>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "用户更新失败，请稍后再试");
    }
  }

  /**
   * 删除用户信息
   * @param {number} id 用户ID
   * @returns {Promise<ApiResult<UpdateResult> | ApiResult<null>>} 统一返回结果
   */
  async remove(id: number): Promise<ApiResult<UpdateResult> | ApiResult<null>> {
    try {
      let data = await this.userRepository.softDelete(id);
      return ApiResult.success<UpdateResult>({ data });
    } catch (error) {
      return ApiResult.error<null>(error || "用户删除失败，请稍后再试");
    }
  }

  /**
   * 登录
   * @param {LogInDto} logInDto 登录参数
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<UserLogin> | ApiResult<null>>} 统一返回结果
   */
  async logIn(logInDto: LogInDto, platform: string = "admin"): Promise<ApiResult<UserLogin> | ApiResult<null>> {
    this.logger.info("用户登录", { logInDto, platform });
    try {
      let data = await this.userRepository.findOne({
        where: { account: logInDto.account, platform },
        relations: ["roles"],
      });

      if (!data) {
        return ApiResult.error<null>("用户不存在");
      }
      const status = await bcryptService.validateStr(logInDto.password, data.password);
      if (!status) {
        return ApiResult.error<null>("账号或密码错误");
      }

      // 这个状态需要自定义
      if (data.status === 2) {
        return ApiResult.error<null>("当前账号已被禁用，请联系管理员！");
      }
      let { password, ...info } = data;

      let options = getPlatformJwtConfig(platform) as JwtConfig;
      let userInfo = {
        userInfo: info,
        token_type: "Bearer",
        access_token: this.jwtService.sign(info, {
          secret: options.secret,
          expiresIn: options.jwt_expires_in + "s",
        }),
        refresh_token: this.jwtService.sign(
          { id: info.id },
          {
            secret: options.secret,
            expiresIn: options.jwt_refresh_expires_in,
          }
        ),
      };
      return ApiResult.success<UserLogin>({ data: userInfo });
    } catch (error) {
      this.logger.error("登录失败", error);
      return ApiResult.error<null>(error || "用户登录失败，请稍后再试");
    }
  }

  /**
   * 使用 refresh_token 刷新token
   * @param refreshToken refresh_token
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<RefreshToken> | ApiResult<null>>} 统一返回结果
   */
  async refreshToken(
    refreshToken: string,
    platform: string = "admin"
  ): Promise<ApiResult<RefreshToken> | ApiResult<null>> {
    try {
      let options = getPlatformJwtConfig(platform) as JwtConfig;
      let { id } = this.jwtService.verify(refreshToken, {
        secret: options.secret,
      });
      let user = await this.userRepository.findOne({
        where: { id, platform },
      });
      if (!user) {
        return ApiResult.error<null>({
          data: null,
          message: "用户不存在",
          code: 401,
        });
      }

      let { password, ...data } = user;
      let token = this.jwtService.sign(data, {
        secret: options.secret,
        expiresIn: options.jwt_expires_in + "s",
      });
      return ApiResult.success<RefreshToken>({
        data: {
          token_type: "Bearer",
          access_token: token,
        },
      });
    } catch (error) {
      return ApiResult.error<null>(error || "刷新token失败，请重新登录！");
    }
  }
}
