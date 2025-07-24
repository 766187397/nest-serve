import { ApiResult } from "@/common/utils/result";
import { Inject, Injectable } from "@nestjs/common";
import { BaseService } from "@/common/service/base";
import { Log } from "./entities/logger.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FindLogDtoByPage, LogOptionalDto } from "./dto/index";
import { PageApiResult } from "@/types/public";

@Injectable()
export class LoggerService extends BaseService {
  constructor(
    @InjectRepository(Log, "logger")
    private logRepository: Repository<Log>
  ) {
    super();
  }

  /**
   * 创建日志
   * @param {LogOptionalDto} logOptionalDto
   */
  async create(logOptionalDto: LogOptionalDto) {
    let data = this.logRepository.create(logOptionalDto);
    await this.logRepository.save(data);
  }

  /**
   * 分页查询日志
   * @param {FindLogDtoByPage} findLogDtoByPage
   * @param {string} platform
   * @returns {Promise<ApiResult<PageApiResult<Log[]>>>} 统一返回结果
   */
  async findByPage(
    findLogDtoByPage: FindLogDtoByPage,
    platform: string = "admin"
  ): Promise<ApiResult<PageApiResult<Log[]> | null>> {
    try {
      let { take, skip } = this.buildCommonPaging(findLogDtoByPage?.page, findLogDtoByPage?.pageSize);
      let where = this.buildCommonQuery(findLogDtoByPage);
      let order = this.buildCommonSort(findLogDtoByPage?.sort);
      // 查询符合条件的用户
      const [data, total] = await this.logRepository.findAndCount({
        where: {
          ...where,
          platform: platform,
        },
        order: {
          ...order,
        },
        skip, // 跳过的条数
        take, // 每页条数
      });

      // 计算总页数
      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<Log[]>>({
        data: {
          data,
          total,
          totalPages,
          page: findLogDtoByPage?.page || 1,
          pageSize: findLogDtoByPage?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error<null>(error || "查询日志失败，请稍后重试");
    }
  }
}
