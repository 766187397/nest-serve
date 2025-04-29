import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/module/users/entities/user.entity";

@Injectable()
export class defaultData implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
  }

  // 插入默认用户数据
  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
      // 如果没有用户，插入默认数据
      let password = "123456";
      const users = [
        {
          userName: "admin",
          nickName: "管理员",
          password,
          phoneNumber: "18888888888",
          email: "admin@example.com",
          sex: "0",
        },
        {
          userName: "john_doe",
          nickName: "John Doe",
          phoneNumber: "18888888889",
          email: "john@example.com",
          password,
          sex: "0",
        },
      ];
      await this.userRepository.save(users); // 插入数据
    }
  }
}
