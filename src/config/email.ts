// 获取环境变量
const env = process.env;
let secure = true;
if (env.EMAIL_SECURE == "true") {
  secure = true;
} else if (env.EMAIL_SECURE == "false") {
  secure = false;
}

/** 邮箱配置 */
export class EmailConfig {
  static QQ = {
    host: env.EMAIL_HOST, // SMTP主机
    port: env.EMAIL_PORT, // SMTP端口
    secure: secure, // 使用SSL
    auth: {
      user: env.EMAIL_USER, // SMTP用户名
      pass: env.EMAIL_PASS, // SMTP密码
    },
  };
}
