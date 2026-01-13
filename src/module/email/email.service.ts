import { Injectable } from '@nestjs/common';
import { CreateEmailDto, FindEmailDto, FindEmailtoByPage, SendEmail, UpdateEmailDto } from './dto';
import { BaseService } from '@/common/service/base';
import * as nodemailer from 'nodemailer';
import { EmailConfig } from '@/config/email';
import { EmailCahce } from '@/types/email';
import { ApiResult } from '@/common/utils/result';
import { Email } from './entities/email.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PageApiResult } from '@/types/public';
import { User } from '@/module/users/entities/user.entity';
import { generateRandomString } from '@/common/utils/tool';
import { emailCache, cacheTime } from '@/config/nodeCache';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { HttpStatusCodes } from '@/common/constants/http-status';

// 创建一个SMTP客户端配置对象
const QQPostbox = nodemailer.createTransport({
  host: EmailConfig.QQ.host,
  port: EmailConfig.QQ.port,
  secure: EmailConfig.QQ.secure,
  auth: {
    user: EmailConfig.QQ.auth.user,
    pass: EmailConfig.QQ.auth.pass,
  },
} as SMTPTransport.Options);

@Injectable()
export class EmailService extends BaseService {
  constructor(
    @InjectRepository(Email)
    private emailRepository: Repository<Email>
  ) {
    super();
  }

  /**
   * 创建邮箱模板
   * @param {CreateEmailDto} createEmailDto
   * @param {string} platform 平台标识字符串(admin/web/app/mini)
   * @returns {Promise<ApiResult<Email | null>>} 统一返回结果
   */
  async create(
    createEmailDto: CreateEmailDto,
    platform: string = 'admin'
  ): Promise<ApiResult<Email | null>> {
    try {
      const emailInfo = await this.emailRepository.findOne({
        where: { type: createEmailDto.type },
      });
      if (emailInfo) {
        return ApiResult.error({
          code: HttpStatusCodes.BAD_REQUEST,
          message: '邮箱模板已存在',
        });
      }

      const email = this.emailRepository.create({
        ...createEmailDto,
        platform,
      });
      const data = await this.emailRepository.save(email);
      return ApiResult.success<Email>({ data });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 分页查询邮箱模板
   * @param {FindEmailtoByPage} findEmailtoByPage
   * @param {string} platform 平台标识字符串(admin/web/app/mini)
   * @returns {Promise<ApiResult<PageApiResult<Email[]> | null>>} 统一返回结果
   */
  async findByPage(
    findEmailtoByPage: FindEmailtoByPage,
    platform: string = 'admin'
  ): Promise<ApiResult<PageApiResult<Email[]> | null>> {
    try {
      const { take, skip } = this.buildCommonPaging(
        findEmailtoByPage?.page,
        findEmailtoByPage?.pageSize
      );
      const where = this.buildCommonQuery(findEmailtoByPage);
      const order = this.buildCommonSort(findEmailtoByPage?.sort);
      // 查询符合条件的用户
      const [data, total] = await this.emailRepository.findAndCount({
        where: {
          ...where,
          platform: platform,
          title: findEmailtoByPage?.title ? ILike(`%${findEmailtoByPage.title}%`) : undefined,
        },
        order: {
          ...order,
        },
        skip, // 跳过的条数
        take, // 每页条数
      });

      // 计算总页数
      const totalPages = Math.ceil(total / take);
      return ApiResult.success<PageApiResult<Email[]>>({
        data: {
          data,
          total,
          totalPages,
          page: findEmailtoByPage?.page || 1,
          pageSize: findEmailtoByPage?.pageSize || 10,
        },
      });
    } catch (error) {
      return ApiResult.error(error);
    }
  }

  /**
   * 查询所有邮箱模板
   * @param {FindEmailDto} findEmailDto
   * @param platform 平台标识字符串(admin/web/app/mini)
   * @returns {Promise<ApiResult<Email[] | null>>} 统一返回结果
   */
  async findAll(
    findEmailDto: FindEmailDto,
    platform: string = 'admin'
  ): Promise<ApiResult<Email[] | null>> {
    try {
      const where = this.buildCommonQuery(findEmailDto);
      const order = this.buildCommonSort(findEmailDto?.sort);
      const data = await this.emailRepository.find({
        where: {
          ...where,
          platform,
          title: findEmailDto?.title ? ILike(`%${findEmailDto.title}%`) : undefined,
        },
        order: {
          ...order,
        },
      }); // 查询所有用户并返回;
      return ApiResult.success<Email[]>({ data });
    } catch (error) {
      return ApiResult.error(error);
    }
  }

  /**
   * 查询邮箱详情
   * @param {number} id
   * @returns {Promise<ApiResult<Email | null>>} 统一返回结果
   */
  async findOne(id: number): Promise<ApiResult<Email | null>> {
    try {
      const email = await this.emailRepository.findOneBy({ id });
      return ApiResult.success<Email>({ data: email });
    } catch (error) {
      return ApiResult.error<null>(error);
    }
  }

  /**
   * 更新邮箱模板
   * @param {number} id
   * @param {UpdateEmailDto} updateEmailDto
   * @returns {Promise<ApiResult<null>>} 统一返回结果
   */
  async update(id: number, updateEmailDto: UpdateEmailDto): Promise<ApiResult<null>> {
    try {
      const email = await this.emailRepository.findOneBy({ id });
      if (!email) {
        return ApiResult.error({
          code: HttpStatusCodes.NOT_FOUND,
          message: '邮箱不存在',
        });
      }
      Object.assign(email, updateEmailDto);
      await this.emailRepository.save(email);
      return ApiResult.success();
    } catch (error) {
      return ApiResult.error(error);
    }
  }

  /**
   * 删除邮箱
   * @param {number} id id
   * @returns { Promise<ApiResult<null>>} 统一返回结果
   */
  async remove(id: number): Promise<ApiResult<null>> {
    try {
      const data = await this.emailRepository.softDelete(id);
      return ApiResult.success();
    } catch (error) {
      return ApiResult.error(error);
    }
  }

  /**
   * 发送邮件
   * @param {SendEmail} sendEmail
   * @param {User} userInfo 请求用户信息
   * @returns {ApiResult<any> | Promise<ApiResult<any>>} 统一返回结果
   */
  async sendEmail(sendEmail: SendEmail, userInfo?: User): Promise<ApiResult<any>> {
    try {
      if (
        !(await this.buildVerify({
          code: sendEmail.code,
          codeKey: sendEmail.codeKey,
        }))
      ) {
        return ApiResult.error('验证码错误或者不存在！');
      }

      const emailTemplate = await this.emailRepository.findOneBy({
        type: sendEmail.type,
      });
      if (!emailTemplate) {
        return ApiResult.error({
          code: HttpStatusCodes.NOT_FOUND,
          message: '邮箱模板不存在',
        });
      }

      const { text: title } = this.handleTemplate(emailTemplate.title, userInfo);

      const { text: html, code } = this.handleTemplate(emailTemplate.content, userInfo);

      const info: EmailCahce = (await emailCache.get(sendEmail.email)) as EmailCahce;
      if (info && info.state) {
        return ApiResult.error({
          code: HttpStatusCodes.TOO_MANY_REQUESTS,
          data: null,
          message: `请勿频繁发送邮件，请在${info.time}后重试`,
        });
      }

      const mailOptions = {
        from: EmailConfig.QQ.auth.user,
        to: sendEmail.email,
        subject: title,
        html,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      };
      return new Promise((resolve, reject) => {
        QQPostbox.sendMail(mailOptions, async (error, info) => {
          if (error) {
            reject(
              ApiResult.error({
                code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                message: '发送失败',
                data: `${error}`,
              })
            );
          }

          const time = this.dayjs().add(cacheTime, 'm');
          await emailCache.set(sendEmail.email, {
            state: true,
            time: time.format('YYYY-MM-DD HH:mm:ss'),
            code: code,
          });
          resolve(ApiResult.success({ data: info }));
        });
      });
    } catch (error) {
      return ApiResult.error({
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        message: '发送失败',
        data: `${error}`,
      });
    }
  }

  /**
   * 处理模板自定义变量
   * @param text 内容
   * @param userInfo 用户信息
   * @return  返回处理后的内容
   */
  handleTemplate(text: string, userInfo: User | undefined): { text: string; code: string } {
    const code = generateRandomString(6);
    const reg = new RegExp('\\{(\\w+)\\}', 'g');
    const createdAt = this.dayjs().format('YYYY-MM-DD HH:mm:ss');
    return {
      text: text.replace(reg, (match, key) => {
        if (key === 'code') {
          return code; // 如果是code变量，直接返回生成的验证码
        } else if (key === 'createdAt') {
          return createdAt; // 如果是createdAt变量，直接返回当前时间
        }
        return userInfo ? userInfo[key] : '';
      }),
      code,
    };
  }
}
