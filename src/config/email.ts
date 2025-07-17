/** 邮箱配置 */
export class EmailConfig {
  static QQ = {
    host: "smtp.qq.com", // SMTP主机
    port: 465, // SMTP端口
    secure: true, // 使用SSL
    auth: {
      user: "766187397@qq.com", // SMTP用户名
      pass: "zolkzbawjigzbcha", // SMTP密码
    },
  };
}
