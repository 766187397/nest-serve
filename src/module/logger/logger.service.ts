import { ApiResult } from '@/common/utils/result';
import { Inject, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Log } from './entities/logger.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { FindLogDtoByPage } from './dto/index';
import { PageApiResult } from '@/types/public';
import { Request } from 'express';
import { buildCommonQuery, buildCommonSort, buildCommonPaging } from '@/common/utils/service.util';

@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Log, 'logger')
    private logRepository: Repository<Log>
  ) {}

  /**
   * 创建日志
   * @param request 请求对象
   * @param data 日志数据
   * @param statusCode 状态码
   */
  async create(request: Request, data: string = '', statusCode: string = '200') {
    const url: string = request.url || '';
    const platform: string = url.split('/')[3] || '';
    const { account = '', nickName = '' } = request.userInfo || {};
    const method = request.method || '';
    let {
      referer = '',
      'sec-ch-ua-platform': apiPlatform = '',
      'sec-ch-ua': browser = '',
    } = request.headers;
    try {
      browser = (browser as string).replace(/"/g, '');
      apiPlatform = (apiPlatform as string).replace(/"/g, '');
    } catch (error) {
      apiPlatform = '';
      browser = '';
    }

    // 获取客户端的 IP 地址
    const IP =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.connection.remoteAddress ||
      request.ip ||
      '';

    const resData = JSON.stringify(data);
    const responseTime = Date.now() - request['startTime'] || 0; // 计算响应时间(毫秒)
    try {
      const data = {
        account,
        nickName,
        url,
        method,
        referer,
        apiPlatform,
        platform,
        browser,
        responseTime,
        resData,
        statusCode,
        IP,
      };

      if (!data.resData) {
        data.resData = '';
      }

      const logger = this.logRepository.create(data);
      await this.logRepository.save(logger);
    } catch (error) {
      console.error('日志插入失败:', error);
    }
  }

  /**
   * 分页查询日志
   * @param {FindLogDtoByPage} findLogDtoByPage
   * @param {string} platform
   * @returns {Promise<ApiResult<PageApiResult<Log[]>>>} 统一返回结果
   */
  async findByPage(
    findLogDtoByPage: FindLogDtoByPage,
    platform: string = 'admin'
  ): Promise<ApiResult<PageApiResult<Log[]> | null>> {
    try {
      const { take, skip } = buildCommonPaging(findLogDtoByPage?.page, findLogDtoByPage?.pageSize);
      const where = buildCommonQuery(findLogDtoByPage);
      const order = buildCommonSort(findLogDtoByPage?.sort);
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
      return ApiResult.error<null>(error || '查询日志失败，请稍后重试');
    }
  }

  /**
   * 删除30天前的日志
   * @description 该方法用于删除30天前的日志记录，由定时任务模块调用
   * @returns {Promise<void>}
   */
  async deleteLogs(): Promise<void> {
    try {
      console.log('定时任务删除日志');
      await this.logRepository.delete({
        createdAt: LessThan(dayjs().subtract(30, 'day').toDate()),
      });
    } catch (error) {
      console.log('日志删除失败，请稍后再试', error);
      throw error;
    }
  }
}
