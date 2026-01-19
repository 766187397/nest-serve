// Express中有一个User的类型，如果不取别名类型会走到他内置的User中
import { User as MyUser } from '@/module/users/entities/user.entity';
import { OpenAPIObject } from '@nestjs/swagger';

declare global {
  namespace Express {
    interface Request {
      /** 当前登录用户信息 */
      userInfo?: MyUser;
      /** 请求开始时间 */
      startTime?: number;
    }
  }
  // 全局变量
  /** 项目URL */
  var url: string;
  /** 环境变量文件路径 */
  var envFilePath: string;
  /** Swagger文档 */
  var swaggerDocument: OpenAPIObject;
}
