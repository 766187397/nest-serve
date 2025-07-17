import { Injectable } from "@nestjs/common";
import { CreateEmailDto, SendEmail, UpdateEmailDto } from "./dto";
import { BaseService } from "@/common/service/base";
import * as nodemailer from "nodemailer";
import * as nodeCache from "node-cache";
import { EmailConfig } from "@/config/email";
import { EmailCahce } from "@/types/email";
import { ApiResult } from "@/common/utils/result";
import { resolve } from "path";

// 创建一个NodeCache实例，设置过期时间为60秒
const cache = new nodeCache({ stdTTL: 60 });

// 创建一个SMTP客户端配置对象
const QQPostbox = nodemailer.createTransport({
  host: EmailConfig.QQ.host,
  port: EmailConfig.QQ.port,
  secure: EmailConfig.QQ.secure,
  auth: {
    user: EmailConfig.QQ.auth.user,
    pass: EmailConfig.QQ.auth.pass,
  },
});

@Injectable()
export class EmailService extends BaseService {
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

  /**
   * 发送邮件
   * @param {SendEmail} sendEmail
   * @returns
   */
  sendEmail(sendEmail: SendEmail): ApiResult<any> | Promise<ApiResult<any>> {
    try {
      // 检查该收件人是否在缓存中
      const info: EmailCahce = cache.get(sendEmail.email) as EmailCahce;
      if (info && info.state) {
        return ApiResult.error({
          code: 429,
          data: null,
          message: `请勿频繁发送邮件，请在${info.time}后重试`,
        });
      }

      // 设置邮件信息
      let mailOptions = {
        from: EmailConfig.QQ.auth.user,
        to: sendEmail.email,
        subject: sendEmail.title,
        // text: "",
        html: sendEmail.content,
      };
      return new Promise((resolve, reject) => {
        // 发送邮件
        QQPostbox.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(ApiResult.error({ code: 500, message: "发送失败", data: `${error}` }));
          }

          // 将收件人的邮箱地址添加到缓存中
          let time = this.dayjs().add(1, "m");
          cache.set(sendEmail.email, {
            state: true,
            time: time.format("YYYY-MM-DD HH:mm:ss"),
          });
          resolve(ApiResult.success({ data: info }));
        });
      });
    } catch (error) {
      return ApiResult.error({ code: 500, message: "发送失败", data: `${error}` });
    }
  }
}
