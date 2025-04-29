import { User as MyUser } from "@/module/users/entities/user.entity"; // 根据实际用户模型路径调整

declare global {
  namespace Express {
    interface Request {
      userInfo?: MyUser;
    }
  }
  interface Request {
    userInfo?: MyUser;
  }
}
