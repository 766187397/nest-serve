import { Injectable } from "@nestjs/common";
import { BaseService } from "@/common/service/base";
import { CreateNoticeDto, UpdateNoticeDto } from "./dto";
import { ApiResult } from "@/common/utils/result";
import { Notice } from "./entities/notice.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
   * @returns {Promise<ApiResult<Notice> | ApiResult<null>>} 统一返回结果
   */
  async create(createNoticeDto: CreateNoticeDto): Promise<ApiResult<Notice> | ApiResult<null>> {
    try {
      let notice = this.noticeRepository.create(createNoticeDto);
      console.log("notice :>> ", notice);
      let data = await this.noticeRepository.save(notice);
      console.log("data :>> ", data);
      return ApiResult.success<Notice>({ data });
    } catch (error) {
      console.log("error :>> ", error);
      return ApiResult.error<null>(error);
    }
  }

  findAll() {
    return `This action returns all notice`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notice`;
  }

  update(id: number, updateNoticeDto: UpdateNoticeDto) {
    return `This action updates a #${id} notice`;
  }

  remove(id: number) {
    return `This action removes a #${id} notice`;
  }
}
