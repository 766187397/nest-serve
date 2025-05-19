import { Injectable } from "@nestjs/common";
import { BaseService } from "@/common/service/base";
import { CreateNoticeDto, FindNoticeDtoByPage, UpdateNoticeDto } from "./dto";
import { ApiResult } from "@/common/utils/result";
import { Notice } from "./entities/notice.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
   * @returns {Promise<ApiResult<Notice | null>>} 统一返回结果
   */
  async create(createNoticeDto: CreateNoticeDto): Promise<ApiResult<Notice | null>> {
    try {
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
   * @param {string} platform 平台
   * @returns {Promise<ApiResult<PageApiResult<Notice[]> | null>>} 统一返回结果
   */
  async findByPage(
    findNoticeDtoByPage: FindNoticeDtoByPage,
    platform?: string
  ): Promise<ApiResult<PageApiResult<Notice[]> | null>> {
    try {
      let { take, skip } = this.buildCommonPaging(findNoticeDtoByPage?.page, findNoticeDtoByPage?.pageSize);
      let where = this.buildCommonQuery(findNoticeDtoByPage);
      let order = this.buildCommonSort(findNoticeDtoByPage);
      let [data, total] = await this.noticeRepository.findAndCount({
        where: {
          ...where,
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
   * 通过id查看详情
   * @param {number} id
   * @returns { Promise<ApiResult<Notice | null>>} 统一返回结果
   */
  async findOne(id: number): Promise<ApiResult<Notice | null>> {
    try {
      let data = await this.noticeRepository.findOne({ where: { id } });
      return ApiResult.success<Notice | null>({ data });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 更新通知
   * @param {number} id
   * @param {UpdateNoticeDto} updateNoticeDto
   * @returns { Promise<ApiResult<Notice | null>>} 统一返回结果
   */
  async update(id: number, updateNoticeDto: UpdateNoticeDto): Promise<ApiResult<Notice | null>> {
    try {
      let notice = await this.noticeRepository.findOne({ where: { id } });
      if (!notice) {
        return ApiResult.error<null>("通知不存在");
      }
      notice = { ...notice, ...updateNoticeDto };
      let data = await this.noticeRepository.save(notice);
      return ApiResult.success<Notice>({ data });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 删除通知
   * @param {number} id
   * @returns { Promise<ApiResult<null>>} 统一返回结果
   */
  async remove(id: number): Promise<ApiResult<null>> {
    try {
      await this.noticeRepository.softDelete(id);
      return ApiResult.success<null>({});
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }
}
