import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Repository, LessThan } from 'typeorm';
import * as dayjs from 'dayjs';
import { CronJob } from 'cron';
import { Schedule } from './entities/schedule.entity';
import { ScheduleLog } from './entities/schedule-log.entity';
import { Log } from '@/module/logger/entities/logger.entity';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  FindScheduleDtoByPage,
  FindScheduleLogDtoByPage,
} from './dto/index';
import { ApiResult } from '@/common/utils/result';
import { buildCommonQuery, buildCommonSort, buildCommonPaging } from '@/common/utils/service.util';
import { PageApiResult } from '@/types/public';
import { handlePlatformQuery } from '@/common/utils/query.util';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(ScheduleLog)
    private scheduleLogRepository: Repository<ScheduleLog>,
    @InjectRepository(Log, 'logger')
    private logRepository: Repository<Log>,
    @Inject(SchedulerRegistry)
    private schedulerRegistry: SchedulerRegistry
  ) {}

  /**
   * 创建定时任务
   * @param {CreateScheduleDto} createScheduleDto 创建任务DTO
   * @param {string} platform 平台标识
   * @returns {Promise<ApiResult<Schedule | null>>} 统一返回结果
   */
  async create(
    createScheduleDto: CreateScheduleDto,
    platform: string = 'admin'
  ): Promise<ApiResult<Schedule | null>> {
    try {
      const { jobName } = createScheduleDto;
      const existingSchedule = await this.scheduleRepository.findOne({
        where: { jobName, platform },
      });
      if (existingSchedule) {
        return ApiResult.error<null>('任务标识已存在');
      }

      const schedule = this.scheduleRepository.create({
        ...createScheduleDto,
        platform,
        nextExecutionTime: this.getNextExecutionTime(createScheduleDto.cronExpression),
      });
      const data = await this.scheduleRepository.save(schedule);

      if (data.status === 1) {
        await this.registerCronJob(data);
      }

      return ApiResult.success<Schedule>({ data });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '定时任务创建失败');
    }
  }

  /**
   * 分页查询定时任务
   * @param {FindScheduleDtoByPage} query 查询条件
   * @param {string} platform 平台标识
   * @returns {Promise<ApiResult<PageApiResult<Schedule[]> | null>>} 统一返回结果
   */
  async findByPage(
    query: FindScheduleDtoByPage,
    platform: string = 'admin'
  ): Promise<ApiResult<PageApiResult<Schedule[]> | null>> {
    try {
      const { take, skip } = buildCommonPaging(query?.page, query?.pageSize);
      const where = buildCommonQuery(query);
      const order = buildCommonSort(query?.sort);

      const [data, total] = await this.scheduleRepository.findAndCount({
        where: {
          ...where,
          platform: handlePlatformQuery(platform, query?.platform),
          name: query?.name ? `%${query.name}%` : undefined,
        },
        order: {
          ...order,
        },
        skip,
        take,
      });

      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<Schedule[]>>({
        data: {
          data,
          total,
          totalPages,
          page: query?.page || 1,
          pageSize: query?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '定时任务查询失败');
    }
  }

  /**
   * 查询所有定时任务
   * @param {FindScheduleDtoByPage} query 查询条件
   * @param {string} platform 平台标识
   * @returns {Promise<ApiResult<Schedule[] | null>>} 统一返回结果
   */
  async findAll(
    query: FindScheduleDtoByPage,
    platform: string = 'admin'
  ): Promise<ApiResult<Schedule[] | null>> {
    try {
      const where = buildCommonQuery(query);
      const order = buildCommonSort(query?.sort);

      const data = await this.scheduleRepository.find({
        where: {
          ...where,
          platform: handlePlatformQuery(platform, query?.platform),
          name: query?.name ? `%${query.name}%` : undefined,
        },
        order: {
          ...order,
        },
      });

      return ApiResult.success<Schedule[]>({ data });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '定时任务查询失败');
    }
  }

  /**
   * 通过ID查询定时任务
   * @param {string} id 任务ID
   * @param {string} platform 请求头中的平台标识
   * @returns {Promise<ApiResult<Schedule | null>>} 统一返回结果
   */
  async findOne(id: string, platform?: string): Promise<ApiResult<Schedule | null>> {
    try {
      const finalPlatform = handlePlatformQuery(platform, undefined);
      const data = await this.scheduleRepository.findOne({ where: { id, platform: finalPlatform } });
      if (!data) {
        return ApiResult.error<null>('定时任务不存在');
      }
      return ApiResult.success<Schedule>({ data });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '定时任务查询失败');
    }
  }

  /**
   * 更新定时任务
   * @param {string} id 任务ID
   * @param {UpdateScheduleDto} updateScheduleDto 更新DTO
   * @param {string} platform 请求头中的平台标识
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
    platform?: string
  ): Promise<ApiResult<null>> {
    try {
      const finalPlatform = handlePlatformQuery(platform, undefined);
      const schedule = await this.scheduleRepository.findOne({ where: { id, platform: finalPlatform } });
      if (!schedule) {
        return ApiResult.error<null>('定时任务不存在');
      }

      if (updateScheduleDto.jobName && updateScheduleDto.jobName !== schedule.jobName) {
        const existingSchedule = await this.scheduleRepository.findOne({
          where: {
            jobName: updateScheduleDto.jobName,
            platform: handlePlatformQuery(platform, schedule.platform),
          },
        });
        if (existingSchedule) {
          return ApiResult.error<null>('任务标识已存在');
        }
      }

      Object.assign(schedule, updateScheduleDto);
      if (updateScheduleDto.cronExpression) {
        schedule.nextExecutionTime = this.getNextExecutionTime(updateScheduleDto.cronExpression);
      }

      await this.scheduleRepository.save(schedule);

      const jobName = schedule.jobName;
      if (this.schedulerRegistry.doesExist('cron', jobName)) {
        this.schedulerRegistry.deleteCronJob(jobName);
      }

      if (schedule.status === 1) {
        await this.registerCronJob(schedule);
      }

      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '定时任务更新失败');
    }
  }

  /**
   * 删除定时任务
   * @param {string} id 任务ID
   * @param {string} platform 请求头中的平台标识
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async remove(id: string, platform?: string): Promise<ApiResult<null>> {
    try {
      const finalPlatform = handlePlatformQuery(platform, undefined);
      const schedule = await this.scheduleRepository.findOne({ where: { id, platform: finalPlatform } });
      if (!schedule) {
        return ApiResult.error<null>('定时任务不存在');
      }

      const jobName = schedule.jobName;
      if (this.schedulerRegistry.doesExist('cron', jobName)) {
        this.schedulerRegistry.deleteCronJob(jobName);
      }

      await this.scheduleRepository.softDelete({ id, platform: finalPlatform });
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '定时任务删除失败');
    }
  }

  /**
   * 启用/禁用定时任务
   * @param {string} id 任务ID
   * @param {number} status 状态 1-启用 2-禁用
   * @param {string} platform 请求头中的平台标识
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async toggleStatus(id: string, status: number, platform?: string): Promise<ApiResult<null>> {
    try {
      const finalPlatform = handlePlatformQuery(platform, undefined);
      const schedule = await this.scheduleRepository.findOne({ where: { id, platform: finalPlatform } });
      if (!schedule) {
        return ApiResult.error<null>('定时任务不存在');
      }

      schedule.status = status;
      await this.scheduleRepository.save(schedule);

      const jobName = schedule.jobName;
      if (status === 1) {
        if (!this.schedulerRegistry.doesExist('cron', jobName)) {
          await this.registerCronJob(schedule);
        }
      } else {
        if (this.schedulerRegistry.doesExist('cron', jobName)) {
          this.schedulerRegistry.deleteCronJob(jobName);
        }
      }

      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '定时任务状态切换失败');
    }
  }

  /**
   * 手动执行定时任务
   * @param {string} id 任务ID
   * @param {string} platform 请求头中的平台标识
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async executeManually(id: string, platform?: string): Promise<ApiResult<null>> {
    try {
      const finalPlatform = handlePlatformQuery(platform, undefined);
      const schedule = await this.scheduleRepository.findOne({ where: { id, platform: finalPlatform } });
      if (!schedule) {
        return ApiResult.error<null>('定时任务不存在');
      }

      this.executeJob(schedule);
      return ApiResult.success<null>();
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '定时任务执行失败');
    }
  }

  /**
   * 分页查询任务执行日志
   * @param {FindScheduleLogDtoByPage} query 查询条件
   * @param {string} platform 平台标识
   * @returns {Promise<ApiResult<PageApiResult<ScheduleLog[]> | null>>} 统一返回结果
   */
  async findLogsByPage(
    query: FindScheduleLogDtoByPage,
    platform: string = 'admin'
  ): Promise<ApiResult<PageApiResult<ScheduleLog[]> | null>> {
    try {
      const { take, skip } = buildCommonPaging(query?.page, query?.pageSize);
      const where = buildCommonQuery(query);
      const order = buildCommonSort(query?.sort);

      let scheduleIds: string[] = [];
      if (query.scheduleName) {
        const schedules = await this.scheduleRepository.find({
          where: {
            platform: handlePlatformQuery(platform, query?.platform),
            name: `%${query.scheduleName}%`,
          },
        });
        scheduleIds = schedules.map((s) => s.id);
      }

      const [data, total] = await this.scheduleLogRepository.findAndCount({
        where: {
          ...where,
          scheduleId: query.scheduleId || (scheduleIds.length > 0 ? undefined : undefined),
          executionStatus: query.status !== undefined ? String(query.status) : undefined,
        },
        order: {
          ...order,
        },
        skip,
        take,
        relations: ['schedule'],
      });

      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<ScheduleLog[]>>({
        data: {
          data,
          total,
          totalPages,
          page: query?.page || 1,
          pageSize: query?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error<null>((error as Error)?.message || '任务日志查询失败');
    }
  }

  /**
   * 注册Cron任务
   * @param {Schedule} schedule 定时任务实体
   */
  private async registerCronJob(schedule: Schedule): Promise<void> {
    const { CronJob } = await import('cron');
    const job = new CronJob(schedule.cronExpression, async () => {
      await this.executeJob(schedule);
    });

    this.schedulerRegistry.addCronJob(schedule.jobName, job);
    job.start();
  }

  /**
   * 执行任务
   * @param {Schedule} schedule 定时任务实体
   */
  private async executeJob(schedule: Schedule): Promise<void> {
    const startTime = Date.now();
    const executionTime = new Date();
    let status = 'success';
    let errorMessage: string | null = null;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('任务执行超时')), schedule.timeout * 1000);
      });

      const jobPromise = this.executeJobLogic(schedule.jobName);

      await Promise.race([jobPromise, timeoutPromise]);

      schedule.lastExecutionTime = executionTime;
      schedule.nextExecutionTime = this.getNextExecutionTime(schedule.cronExpression);
      await this.scheduleRepository.save(schedule);
    } catch (error) {
      status = 'failed';
      errorMessage = (error as Error).message;

      if (schedule.retryCount > 0) {
        await this.retryJob(schedule);
      }
    } finally {
      const duration = Date.now() - startTime;
      await this.createScheduleLog(schedule.id, executionTime, status, duration, errorMessage);
    }
  }

  /**
   * 执行任务逻辑
   * @param {string} jobName 任务名称
   */
  private async executeJobLogic(jobName: string): Promise<void> {
    switch (jobName) {
      case 'deleteLogs':
        await this.deleteOldLogs();
        break;
      default:
        throw new Error(`未知的任务: ${jobName}`);
    }
  }

  /**
   * 重试任务
   * @param {Schedule} schedule 定时任务实体
   */
  private async retryJob(schedule: Schedule): Promise<void> {
    for (let i = 0; i < schedule.retryCount; i++) {
      await new Promise((resolve) => setTimeout(resolve, schedule.retryInterval * 1000));
      try {
        await this.executeJobLogic(schedule.jobName);
        return;
      } catch (retryError) {
        if (i === schedule.retryCount - 1) {
          throw retryError;
        }
      }
    }
  }

  /**
   * 创建任务执行日志
   * @param {string} scheduleId 任务ID
   * @param {Date} executionTime 执行时间
   * @param {string} status 执行状态
   * @param {number} duration 执行耗时
   * @param {string} errorMessage 错误信息
   */
  private async createScheduleLog(
    scheduleId: string,
    executionTime: Date,
    status: string,
    duration: number,
    errorMessage: string | null
  ): Promise<void> {
    const log = this.scheduleLogRepository.create({
      scheduleId,
      executionTime,
      executionStatus: status,
      duration,
      errorMessage: errorMessage || '',
    });
    await this.scheduleLogRepository.save(log);
  }

  /**
   * 获取下次执行时间
   * @param {string} cronExpression Cron表达式
   * @returns {Date} 下次执行时间
   */
  private getNextExecutionTime(cronExpression: string): Date {
    const job = new CronJob(cronExpression, () => {});
    return job.nextDate().toJSDate();
  }

  /**
   * 删除旧日志
   */
  private async deleteOldLogs(): Promise<void> {
    await this.logRepository.delete({
      createdAt: LessThan(dayjs().subtract(30, 'day').toDate()),
    });
  }

  /**
   * 应用启动时加载所有启用的任务
   */
  async onModuleInit(): Promise<void> {
    const schedules = await this.scheduleRepository.find({
      where: { status: 1 },
    });

    for (const schedule of schedules) {
      if (!this.schedulerRegistry.doesExist('cron', schedule.jobName)) {
        await this.registerCronJob(schedule);
      }
    }
  }
}
