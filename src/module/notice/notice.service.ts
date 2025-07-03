import { Injectable } from "@nestjs/common";
import { BaseService } from "@/common/service/base";
import { CreateNoticeDto, FindNoticeDtoByPage, FindNoticeDtoByPageByUserOrRole, UpdateNoticeDto } from "./dto";
import { ApiResult } from "@/common/utils/result";
import { Notice } from "./entities/notice.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { PageApiResult } from "@/types/public";
import { NoticeByPageByUserOrRole } from "@/types/notice";
@Injectable()
export class NoticeService extends BaseService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>
  ) {
    super();
  }

  /**
   * 创建通知
   * @param {CreateNoticeDto} createNoticeDto
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<Notice | null>>} 统一返回结果
   */
  async create(createNoticeDto: CreateNoticeDto, platform: string = "admin"): Promise<ApiResult<Notice | null>> {
    try {
      let createData = Object.assign(createNoticeDto, { platform });
      let notice = this.noticeRepository.create(createData);
      let data = await this.noticeRepository.save(notice);
      return ApiResult.success<Notice>({ data });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 分页查询
   * @param {FindNoticeDtoByPage} findNoticeDtoByPage
   * @param {string} platform  平台(admin/web/app/mini)
   * @returns {Promise<ApiResult<PageApiResult<Notice[]> | null>>} 统一返回结果
   */
  async findByPage(
    findNoticeDtoByPage: FindNoticeDtoByPage,
    platform: string = "admin"
  ): Promise<ApiResult<PageApiResult<Notice[]> | null>> {
    try {
      let { take, skip } = this.buildCommonPaging(findNoticeDtoByPage?.page, findNoticeDtoByPage?.pageSize);
      let where = this.buildCommonQuery(findNoticeDtoByPage);
      let order = this.buildCommonSort(findNoticeDtoByPage?.sort);
      let [data, total] = await this.noticeRepository.findAndCount({
        where: {
          ...where,
          title: findNoticeDtoByPage?.title ? ILike(`%${findNoticeDtoByPage.title}%`) : undefined,
          type: findNoticeDtoByPage?.type ? ILike(`%${findNoticeDtoByPage.type}%`) : undefined,
          platform,
        },
        order,
        take,
        skip,
      });
      // 计算总页数
      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<Notice[]>>({
        data: {
          data,
          total,
          totalPages,
          page: findNoticeDtoByPage?.page || 1,
          pageSize: findNoticeDtoByPage?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 分页查询指定平台，当前角色在通知
   * @param {FindNoticeDtoByPageByUserOrRole} findNoticeDtoByPageByUserOrRole 分页
   * @param {string} platform 平台
   * @param {string[]} roleKeys 角色权限数组
   * @returns {Promise<ApiResult<PageApiResult<NoticeByPageByUserOrRole[]> | null>>} 统一返回结果
   */
  async findByPageByUserAndRole(
    findNoticeDtoByPageByUserOrRole: FindNoticeDtoByPageByUserOrRole,
    platform: string,
    roleKeys: string[] | undefined,
    userId: string
  ): Promise<ApiResult<PageApiResult<NoticeByPageByUserOrRole[]> | null>> {
    try {
      let { take, skip } = this.buildCommonPaging(
        findNoticeDtoByPageByUserOrRole?.page,
        findNoticeDtoByPageByUserOrRole?.pageSize
      );
      const queryBuilder = this.noticeRepository.createQueryBuilder("notice");
      // 添加platform精确匹配条件
      queryBuilder.where("notice.platform  = :platform", { platform });
      const type = findNoticeDtoByPageByUserOrRole?.type;
      queryBuilder.andWhere("notice.type = :type", { type });
      roleKeys?.forEach((role, index) => {
        const paramName = `role${index}`;
        const condition = index === 0 ? "where" : "orWhere";
        queryBuilder[condition](`notice.roleKeys  LIKE :${paramName}`, {
          [paramName]: `%${role}%`,
        });
      });

      // 用户ID匹配
      queryBuilder.orWhere(`notice.userIds  LIKE :userId`, {
        userId: `%${userId}%`,
      });

      // 追加查询roleKeys和userIds同时为空
      queryBuilder.orWhere(
        `(notice.roleKeys IS NULL OR notice.roleKeys  = '' AND notice.userIds IS NULL OR notice.userIds  = '')`
      );

      // 添加分页
      let [data, total] = await queryBuilder.skip(skip).take(take).getManyAndCount();
      // 计算总页数
      const totalPages = Math.ceil(total / take);

      let filterData: NoticeByPageByUserOrRole[] = data.map((item) => {
        return {
          id: item.id,
          content: item.content,
          // platform: item.platform,
          // roleKeys: item.roleKeys,
          // specifyTime: item.specifyTime,
          title: item.title,
          type: item.type,
          // userIds: item.userIds,
          createdAt: this.dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: this.dayjs(item.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
          // deletedAt: item.deletedAt,
        };
      });

      return ApiResult.success<PageApiResult<NoticeByPageByUserOrRole[]>>({
        data: {
          data: filterData,
          total,
          totalPages,
          page: findNoticeDtoByPageByUserOrRole?.page || 1,
          pageSize: findNoticeDtoByPageByUserOrRole?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 通过id查看详情
   * @param {string} id
   * @returns { Promise<ApiResult<Notice | null>>} 统一返回结果
   */
  async findOne(id: string): Promise<ApiResult<Notice | null>> {
    try {
      let data = await this.noticeRepository.findOne({ where: { id } });
      return ApiResult.success<Notice | null>({ data });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 更新通知
   * @param {string} id
   * @param {UpdateNoticeDto} updateNoticeDto
   * @returns { Promise<ApiResult<null>>} 统一返回结果
   */
  async update(id: string, updateNoticeDto: UpdateNoticeDto): Promise<ApiResult<null>> {
    try {
      const notice = await this.noticeRepository.findOne({
        where: { id },
      });
      if (!notice) {
        return ApiResult.error<null>("通知不存在");
      }
      Object.assign(notice, updateNoticeDto);
      await this.noticeRepository.save(notice);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 删除通知
   * @param {string} id
   * @returns { Promise<ApiResult<null>>} 统一返回结果
   */
  async remove(id: string): Promise<ApiResult<null>> {
    try {
      await this.noticeRepository.softDelete(id);
      return ApiResult.success<null>({});
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }
}
