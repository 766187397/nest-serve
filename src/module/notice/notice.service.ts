import { Injectable } from "@nestjs/common";
import { BaseService } from "@/common/service/base";
import { CreateNoticeDto, UpdateNoticeDto } from "./dto";

@Injectable()
export class NoticeService extends BaseService {
  create(createNoticeDto: CreateNoticeDto) {
    return "This action adds a new notice";
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
