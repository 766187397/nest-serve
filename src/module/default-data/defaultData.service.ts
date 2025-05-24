import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { bcryptService } from "@/common/utils/bcrypt-hash";
import { User } from "@/module/users/entities/user.entity";
import { Role } from "../roles/entities/role.entity";

@Injectable()
export class defaultData implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoles();
    await this.seedUsers();
  }

  // 插入默认用户数据
  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
      // 如果没有用户，插入默认数据
      const password = await bcryptService.encryptStr("123456");
      const admin = await this.roleRepository.findOne({ where: { roleKey: "admin" } }); // 获取角色
      const web = await this.roleRepository.findOne({ where: { roleKey: "web" } }); // 获取角色
      const users = [
        {
          account: "admin",
          nickName: "管理员",
          password,
          phone: "18888888888",
          email: "admin@example.com",
          sex: "0",
          platform: "admin",
        },
        {
          account: "test",
          nickName: "测试用户",
          phone: "18333333333",
          email: "test@example.com",
          password,
          sex: "0",
          platform: "web",
        },
      ];

      await this.userRepository.save(users); // 插入数据
    }
  }

  private async seedRoles() {
    const count = await this.roleRepository.count();
    if (count === 0) {
      // 如果没有角色，插入默认数据
      const roles = [
        {
          name: "超级管理员",
          roleKey: "admin",
          description: "拥有所有权限",
          platform: "admin",
        },
        {
          name: "普通用户",
          roleKey: "web",
          description: "拥有所有权限",
          platform: "web",
        },
      ];
      await this.roleRepository.save(roles); // 插入数据
    }
  }
}
