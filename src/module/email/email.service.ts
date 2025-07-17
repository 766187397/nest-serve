import { Injectable } from "@nestjs/common";
import { CreateEmailDto, UpdateEmailDto } from "./dto";

@Injectable()
export class EmailService {
  create(createEmailDto: CreateEmailDto, platform: string = "admin") {
    return "This action adds a new email";
  }

  findByPage(findUserDtoByPage: any, platform: string = "admin") {
    return `This action returns all email`;
  }

  findAll(findEmailDto: any, platform: string = "admin") {
    return `This action returns all email`;
  }

  findOne(id: string) {
    return `This action returns a #${id} email`;
  }

  update(id: string, updateEmailDto: UpdateEmailDto) {
    return `This action updates a #${id} email`;
  }

  remove(id: string) {
    return `This action removes a #${id} email`;
  }
}
