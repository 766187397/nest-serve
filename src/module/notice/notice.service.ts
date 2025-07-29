import { Injectable } from "@nestjs/common";
import { BaseService } from "@/common/service/base";
import { CreateNoticeDto, FindNoticeDtoByPage, FindNoticeDtoByPageByUserOrRole, UpdateNoticeDto } from "./dto";
import { ApiResult } from "@/common/utils/result";
import { Notice } from "./entities/notice.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, In, Like, Repository } from "typeorm";
import { PageApiResult } from "@/types/public";
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
      Object.assign(createNoticeDto, { platform });
      let notice = this.noticeRepository.create(createNoticeDto);
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
   * @returns {Promise<ApiResult<PageApiResult<Notice[]> | null>>} 统一返回结果
   */
  async findByPageByUserAndRole(
    findNoticeDtoByPageByUserOrRole: FindNoticeDtoByPageByUserOrRole,
    platform: string,
    roleKeys: string[] | undefined,
    userId: string
  ): Promise<ApiResult<PageApiResult<Notice[]> | null>> {
    try {
      let { take, skip } = this.buildCommonPaging(
        findNoticeDtoByPageByUserOrRole?.page,
        findNoticeDtoByPageByUserOrRole?.pageSize
      );
      const [data, total] = await this.noticeRepository.findAndCount({
        where: [
          {
            platform,
            type: findNoticeDtoByPageByUserOrRole.type,
            userIds: "",
            roleKeys: "",
          },
          {
            platform,
            type: findNoticeDtoByPageByUserOrRole.type,
            userIds: Like(`%${userId}%`),
            roleKeys: roleKeys ? In(roleKeys) : undefined,
          },
        ],
        skip, // 跳过的条数
        take, // 每页条数
      });
      // 计算总页数
      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<Notice[]>>({
        data: {
          data,
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
