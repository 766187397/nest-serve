// Express中有一个User的类型，如果不取别名类型会走到他内置的User中
import { User as MyUser } from "@/module/users/entities/user.entity";

declare global {
  namespace Express {
    interface Request {
      userInfo?: MyUser;
      startTime?: any;
    }
  }
}
