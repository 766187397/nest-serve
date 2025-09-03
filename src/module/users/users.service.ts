import { Injectable } from "@nestjs/common";
import {
  CaptchaDto,
  CreateUserDto,
  FindUserDto,
  FindUserDtoByPage,
  LogInDto,
  UpdateUserDto,
  VerificationCodeLoginDto,
} from "./dto/index";
import { ApiResult } from "@/common/utils/result";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Brackets, ILike, In, Not, Repository, UpdateResult } from "typeorm";
import { BaseService } from "@/common/service/base";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { bcryptService } from "@/common/utils/bcrypt-hash";
import { getPlatformJwtConfig, JwtConfig } from "@/config/jwt";
import { PageApiResult } from "@/types/public";
import { Captcha, RefreshToken, UserLogin } from "@/types/user";
import { Role } from "@/module/roles/entities/role.entity";
import { EmailCahce } from "@/types/email";
import { emailCache, svgCache } from "@/config/nodeCache";
import { exportWithKeyValueHeader, importWithKeyValueHeader } from "@/common/utils/xlsx";
import * as svgCaptcha from "svg-captcha";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UsersService extends BaseService {
  constructor(
    @InjectRepository(User) // NestJS 会根据这个装饰器将 UserRepository 自动注入到 userRepository 变量中。
    private userRepository: Repository<User>, // 这是一个 TypeORM 提供的 Repository 对象，封装了对 User 实体的所有数据库操作方法
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private readonly jwtService: JwtService // JwtService 是 NestJS 提供的用于生成和验证 JWT 的服务
  ) {
    super();
  }

  /**
   * 创建用户
   * @param {CreateUserDto} createUserDto  创建用户DTO
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<User | null>>} 统一返回结果
   */
  async create(createUserDto: CreateUserDto, platform: string = "admin"): Promise<ApiResult<User | null>> {
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
   * @returns {Promise<ApiResult<PageApiResult<User[]> | null>>} 统一返回结果
   */
  async findByPage(
    findUserDtoByPage?: FindUserDtoByPage,
    platform: string = "admin"
  ): Promise<ApiResult<PageApiResult<User[]> | null>> {
    try {
      let { take, skip } = this.buildCommonPaging(findUserDtoByPage?.page, findUserDtoByPage?.pageSize);
      let where = this.buildCommonQuery(findUserDtoByPage);
      let order = this.buildCommonSort(findUserDtoByPage?.sort);
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
   * @returns {Promise<ApiResult<User[] | null>>} 统一返回结果
   */
  async findAll(findUserDto?: FindUserDto, platform: string = "admin"): Promise<ApiResult<User[] | null>> {
    try {
      let where = this.buildCommonQuery(findUserDto);
      let order = this.buildCommonSort(findUserDto?.sort);
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
   * @param {string} id
   * @returns {Promise<ApiResult<User | null>>} 统一返回结果
   */
  async findOne(id: string): Promise<ApiResult<User | null>> {
    try {
      let data = await this.userRepository.findOne({ where: { id } });
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
   * @param {string} id 用户ID
   * @param updateUserDto 更新用户信息
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<ApiResult<null>> {
    try {
      // 查询用户
      const userInfo = await this.userRepository.findOne({
        where: { id },
        relations: ["roles"],
      });
      if (!userInfo) {
        return ApiResult.error("用户不存在");
      }
      // 查询是否存在账号、电话号码或邮箱
      const exist = await this.userRepository.find({
        where: [
          { id: Not(id), account: userInfo.account },
          { id: Not(id), phone: userInfo.phone },
          { id: Not(id), email: userInfo.email },
        ],
      });

      if (exist && exist.length > 0) {
        return ApiResult.error<null>("当前用户已存在账号、电话号码或邮箱！");
      }
      // 密码处理
      if (updateUserDto.password === "") {
        delete updateUserDto.password;
      }
      Object.assign(userInfo, updateUserDto);
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
      await this.userRepository.save(userInfo);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>(error || "用户更新失败，请稍后再试");
    }
  }

  /**
   * 删除用户信息
   * @param {string} id 用户ID
   * @returns {Promise<ApiResult<UpdateResult | null>>} 统一返回结果
   */
  async remove(id: string): Promise<ApiResult<UpdateResult | null>> {
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
   * @returns {Promise<ApiResult<UserLogin | null>>} 统一返回结果
   */
  async logIn(logInDto: LogInDto, platform: string = "admin"): Promise<ApiResult<UserLogin | null>> {
    try {
      if (!this.buildVerify({ code: logInDto.code, codeKey: logInDto.codeKey })) {
        return ApiResult.error("验证码错误或者不存在！");
      }

      let data = await this.userRepository.findOne({
        where: { account: logInDto.account, platform },
        relations: ["roles"],
      });

      if (!data) {
        return ApiResult.error<null>("账号不存在");
      }
      const status = await bcryptService.validateStr(logInDto.password, data.password);
      if (!status) {
        return ApiResult.error<null>("账号或密码错误");
      }

      // 这个状态需要自定义
      if (data.status === 2) {
        return ApiResult.error<null>("当前账号已被禁用，请联系管理员！");
      }
      let { password, deletedAt, platform: userPlatform, ...info } = data;

      let options = getPlatformJwtConfig(platform) as JwtConfig;
      let userInfo = {
        userInfo: {
          ...info,
          createdAt: this.dayjs(info.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: this.dayjs(info.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
        },
        token_type: "Bearer ",
        access_token: this.jwtService.sign(info, {
          secret: options.secret,
          expiresIn: options.jwt_expires_in,
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
      return ApiResult.error<null>(error || "用户登录失败，请稍后再试");
    }
  }

  /**
   * 使用 refresh_token 刷新token
   * @param refreshToken refresh_token
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<RefreshToken | null>>} 统一返回结果
   */
  async refreshToken(
    refreshToken: string,
    platform: string = "admin"
  ): Promise<ApiResult<RefreshToken | null>> {
    try {
      let options = getPlatformJwtConfig(platform) as JwtConfig;
      let { id } = this.jwtService.verify(refreshToken, {
        secret: options.secret,
      });
      let user = await this.userRepository.findOne({
        where: { id, platform },
        relations: ["roles"],
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
        expiresIn: options.jwt_expires_in,
      });
      return ApiResult.success<RefreshToken>({
        data: {
          token_type: "Bearer ",
          access_token: token,
        },
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return ApiResult.error<null>({ data: null, message: "用户身份信息过期，请重新登录！", code: 401 });
      }
      return ApiResult.error<null>(error || "刷新token失败，请重新登录！");
    }
  }

  /**
   * 邮箱登录
   * @param {VerificationCodeLoginDto} verificationCodeLogin
   * @param {string} platform 平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<UserLogin | null>>} 统一返回结果
   */
  async VerificationCodeLogin(
    verificationCodeLogin: VerificationCodeLoginDto,
    platform: string = "admin"
  ): Promise<ApiResult<UserLogin | null>> {
    try {
      let data = await this.userRepository.findOne({
        where: { email: verificationCodeLogin.email, platform },
        relations: ["roles"],
      });
      if (!data) {
        return ApiResult.error<null>("邮箱不存在");
      }
      // 验证码校验逻辑
      // 检查该收件人是否在缓存中
      const cacheData: EmailCahce = emailCache.get(verificationCodeLogin.email) as EmailCahce;
      if (cacheData?.code !== verificationCodeLogin.emailCode) {
        return ApiResult.error<null>("验证码错误或已过期");
      }
      // 如果验证码正确，删除缓存中的验证码
      emailCache.del(verificationCodeLogin.email);

      // 这个状态需要自定义
      if (data.status === 2) {
        return ApiResult.error<null>("当前账号已被禁用，请联系管理员！");
      }
      let { password, deletedAt, platform: userPlatform, ...info } = data;

      let options = getPlatformJwtConfig(platform) as JwtConfig;
      let userInfo = {
        userInfo: {
          ...info,
          createdAt: this.dayjs(info.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: this.dayjs(info.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
        },
        token_type: "Bearer ",
        access_token: this.jwtService.sign(info, {
          secret: options.secret,
          expiresIn: options.jwt_expires_in,
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
      return ApiResult.error<null>(error || "用户登录失败，请稍后再试");
    }
  }

  /**
   * 导出用户列表

   * @param {FindUserDtoByPage} findUserDtoByPage 查询条件
   * @param {string} platform 平台(admin/web/app/mini)
   * @returns {Promise<{buffer: Buffer; fileName: string} | ApiResult<null>>} 成功Excel文件和名称，失败统一返回结果
   */
  async exportUserList(
    findUserDtoByPage?: FindUserDtoByPage,
    platform: string = "admin"
  ): Promise<{ buffer: Buffer; fileName: string } | ApiResult<null>> {
    try {
      let { take, skip } = this.buildCommonPaging(findUserDtoByPage?.page, findUserDtoByPage?.pageSize);
      let where = this.buildCommonQuery(findUserDtoByPage);
      let order = this.buildCommonSort(findUserDtoByPage?.sort);
      // 查询符合条件的用户
      const [data] = await this.userRepository.findAndCount({
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
      return exportWithKeyValueHeader(
        data,
        {
          account: "账号",
          nickName: "昵称",
          email: "邮箱",
          phone: "手机号",
          sex: "性别",
          status: "状态",
          createdAt: "创建时间",
        },
        "用户数据"
      );
    } catch (error) {
      return ApiResult.error<null>(error || "用户查询失败，请稍后再试");
    }
  }

  /**
   * 人机校验
   * @param {CaptchaDto} captchaDto 参数
   * @returns {Promise<ApiResult<Captcha | null>>} 统一返回结果
   */
  async captcha(captchaDto: CaptchaDto): Promise<ApiResult<Captcha | null>> {
    try {
      const options = {
        size: 4,
        ignoreChars: "10ol",
        noise: 3,
        color: true,
        background: captchaDto.background || "#fff",
        width: Number(captchaDto.width) || 150,
        height: Number(captchaDto.height) || 50,
        fontSize: Number(captchaDto.fontSize) || 50,
      };

      const { text, data } = svgCaptcha.create(options);
      const base64 = Buffer.from(data).toString("base64");
      const url = `data:image/svg+xml;base64,${base64}`;
      const codeKey = uuidv4();
      // 存入缓存
      svgCache.set(codeKey, { text });

      return ApiResult.success<Captcha>({
        data: {
          url,
          codeKey,
        },
      });
    } catch (error) {
      return ApiResult.error<null>(error || "生成验证码失败！");
    }
  }
}
