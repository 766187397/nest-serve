import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  FindUserDto,
  FindUserDtoByPage,
  UpdateUserDto,
} from './dto/index';
import { ApiResult } from '@/common/utils/result';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Brackets, ILike, In, Not, Repository, UpdateResult } from 'typeorm';
import { buildCommonQuery, buildCommonSort, buildCommonPaging } from '@/common/utils/service.util';
import { bcryptService } from '@/common/utils/bcrypt-hash';
import { PageApiResult } from '@/types/public';
import { Role } from '@/module/roles/entities/role.entity';
import { exportWithKeyValueHeader } from '@/common/utils/xlsx';
import { HttpStatusCodes } from '@/common/constants/http-status';
import { handlePlatformQuery } from '@/common/utils/query.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) // NestJS 会根据这个装饰器将 UserRepository 自动注入到 userRepository 变量中。
    private userRepository: Repository<User>, // 这是一个 TypeORM 提供的 Repository 对象，封装了对 User 实体的所有数据库操作方法
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {}

  /**
   * 创建用户
   * @param {CreateUserDto} createUserDto  创建用户DTO
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<User | null>>} 统一返回结果
   */
  async create(
    createUserDto: CreateUserDto,
    platform: string = 'admin'
  ): Promise<ApiResult<User | null>> {
    try {
      // 查询数据库，确保 account, phone, email 不存在
      const { account = null, phone = null, email = null, roleIds = [] } = createUserDto;
      // 构建查询条件
      const queryBuilder = this.userRepository.createQueryBuilder('user');
      // 处理平台查询条件
      const finalPlatform = handlePlatformQuery(platform, undefined);
      queryBuilder.andWhere('user.platform = :platform', { platform: finalPlatform });
      if (account || phone || email) {
        // 使用Brackets，防止orWhere的优先级高于andWhere的platform 条件
        queryBuilder.andWhere(
          new Brackets((qb) => {
            if (account) qb.where('user.account = :account', { account });
            if (phone) qb.orWhere('user.phone = :phone', { phone });
            if (email) qb.orWhere('user.email = :email', { email });
          })
        );
      }
      // 执行查询
      const existingUser = await queryBuilder.getOne();
      // 如果查询结果存在，返回错误
      if (existingUser) {
        return ApiResult.error<null>('账号、电话号码或邮箱已存在');
      }
      createUserDto.password = await bcryptService.encryptStr(createUserDto.password);
      const user = this.userRepository.create(createUserDto); // 创建 User 实体
      user.platform = platform; // 指定平台
      if (roleIds.length > 0) {
        user.roles = await this.roleRepository.find({
          where: { id: In(roleIds) },
        });
      }
      const data = await this.userRepository.save(user); // 保存到数据库并返回
      return ApiResult.success<User>({ data });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '用户创建失败，请稍后再试');
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
    platform: string = 'admin'
  ): Promise<ApiResult<PageApiResult<User[]> | null>> {
    try {
      const { take, skip } = buildCommonPaging(
        findUserDtoByPage?.page,
        findUserDtoByPage?.pageSize
      );
      const where = buildCommonQuery(findUserDtoByPage);
      const order = buildCommonSort(findUserDtoByPage?.sort);
      // 查询符合条件的用户
      const [data, total] = await this.userRepository.findAndCount({
        where: {
          ...where,
          platform: handlePlatformQuery(platform, findUserDtoByPage?.platform),
          account: findUserDtoByPage?.account ? ILike(`%${findUserDtoByPage.account}%`) : undefined,
          nickName: findUserDtoByPage?.nickName
            ? ILike(`%${findUserDtoByPage.nickName}%`)
            : undefined,
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
      return ApiResult.error<null>((error as Error)?.message || '用户查询失败，请稍后再试');
    }
  }

  /**
   * 查询所有用户
   * @param {FindUserDto} findUserDto 查询条件
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<User[] | null>>} 统一返回结果
   */
  async findAll(
    findUserDto?: FindUserDto,
    platform: string = 'admin'
  ): Promise<ApiResult<User[] | null>> {
    try {
      const where = buildCommonQuery(findUserDto);
      const order = buildCommonSort(findUserDto?.sort);
      const data = await this.userRepository.find({
        where: {
          ...where,
          platform: handlePlatformQuery(platform, findUserDto?.platform),
          account: findUserDto?.account ? ILike(`%${findUserDto.account}%`) : undefined,
          nickName: findUserDto?.nickName ? ILike(`%${findUserDto.nickName}%`) : undefined,
          email: findUserDto?.email ? ILike(`%${findUserDto.email}%`) : undefined,
          phone: findUserDto?.phone ? ILike(`%${findUserDto.phone}%`) : undefined,
        },
        order: {
          ...order,
        },
      }); // 查询所有用户并返回;});
      return ApiResult.success<User[]>({ data });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '用户查询失败，请稍后再试');
    }
  }

  /**
   * 通过ID查询详情
   * @param {string} id
   * @returns {Promise<ApiResult<User | null>>} 统一返回结果
   */
  async findOne(id: string): Promise<ApiResult<User | null>> {
    try {
      const data = await this.userRepository.findOne({ where: { id } });
      if (!data) {
        return ApiResult.error<null>('用户不存在');
      }
      return ApiResult.success<User>({ data });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '用户查询失败，请稍后再试');
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
        relations: ['roles'],
      });
      if (!userInfo) {
        return ApiResult.error('用户不存在');
      }
      // 查询是否存在账号、电话号码或邮箱
      const exist = await this.userRepository.find({
        where: [
          {
            id: Not(id),
            account: userInfo.account,
            platform: userInfo.platform,
          },
          { id: Not(id), phone: userInfo.phone, platform: userInfo.platform },
          { id: Not(id), email: userInfo.email, platform: userInfo.platform },
        ],
      });

      if (exist && exist.length > 0) {
        return ApiResult.error<null>('当前用户已存在账号、电话号码或邮箱！');
      }
      // 密码处理
      if (updateUserDto.password === '') {
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
        userInfo.password = await bcryptService.encryptStr(updateUserDto.password);
      }

      // 重新设置信息
      await this.userRepository.save(userInfo);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '用户更新失败，请稍后再试');
    }
  }

  /**
   * 删除用户信息
   * @param {string} id 用户ID
   * @returns {Promise<ApiResult<UpdateResult | null>>} 统一返回结果
   */
  async remove(id: string): Promise<ApiResult<UpdateResult | null>> {
    try {
      const data = await this.userRepository.softDelete(id);
      return ApiResult.success<UpdateResult>({ data });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '用户删除失败，请稍后再试');
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
    platform: string = 'admin'
  ): Promise<{ buffer: Buffer; fileName: string } | ApiResult<null>> {
    try {
      const { take, skip } = buildCommonPaging(
        findUserDtoByPage?.page,
        findUserDtoByPage?.pageSize
      );
      const where = buildCommonQuery(findUserDtoByPage);
      const order = buildCommonSort(findUserDtoByPage?.sort);
      // 查询符合条件的用户
      const [data] = await this.userRepository.findAndCount({
        where: {
          ...where,
          platform: handlePlatformQuery(platform, findUserDtoByPage?.platform),
          account: findUserDtoByPage?.account ? ILike(`%${findUserDtoByPage.account}%`) : undefined,
          nickName: findUserDtoByPage?.nickName
            ? ILike(`%${findUserDtoByPage.nickName}%`)
            : undefined,
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
          account: '账号',
          nickName: '昵称',
          email: '邮箱',
          phone: '手机号',
          sex: '性别',
          status: '状态',
          createdAt: '创建时间',
        },
        '用户数据'
      );
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '用户查询失败，请稍后再试');
    }
  }


}
