import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { bcryptService } from "@/common/utils/bcrypt-hash";
import { User } from "@/module/users/entities/user.entity";
import { Role } from "../roles/entities/role.entity";
import { Route } from "../routes/entities/route.entity";

@Injectable()
export class defaultData implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoutes();
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
          roles: admin ? [admin] : [],
        },
        {
          account: "test",
          nickName: "测试用户",
          phone: "18333333333",
          email: "test@example.com",
          password,
          sex: "0",
          platform: "web",
          roles: web ? [web] : [],
        },
      ];

      await this.userRepository.save(users); // 插入数据
    }
  }

  /** 角色数据信息 */
  private async seedRoles() {
    const count = await this.roleRepository.count();
    if (count === 0) {
      const route1 = await this.routeRepository.find({ where: { platform: "admin" } }); // 获取路由
      const route2 = await this.routeRepository.find({ where: { platform: "web" } }); // 获取路由
      // 如果没有角色，插入默认数据
      const roles = [
        {
          name: "超级管理员",
          roleKey: "admin",
          description: "拥有所有权限",
          platform: "admin",
          routes: route1,
        },
        {
          name: "普通用户",
          roleKey: "web",
          description: "拥有所有权限",
          platform: "web",
          routes: route2,
        },
      ];
      await this.roleRepository.save(roles); // 插入数据
    }
  }

  /** 路由数据信息 */
  private async seedRoutes() {
    const count = await this.routeRepository.count();
    if (count === 0) {
      const system = await this.routeRepository.save({
        platform: "admin",
        type: "menu",
        name: "system",
        title: "系统管理",
        path: "/system",
        icon: "Setting",
        externalLinks: false,
        redirect: "",
        meta: "",
      });
      // 如果没有路由，插入默认数据
      const routes = [
        {
          platform: "admin",
          type: "menu",
          name: "home",
          title: "首页",
          path: "/home",
          component: "home/Index",
          icon: "HomeFilled",
          externalLinks: false,
          redirect: "",
          meta: "",
          sort: 2,
        },
        {
          platform: "admin",
          type: "menu",
          name: "systemRoute",
          title: "后台路由",
          path: "/system/route",
          component: "system/route/AdminRoute",
          icon: "",
          externalLinks: false,
          redirect: "",
          meta: "",
          parentId: system,
        },
        {
          platform: "web",
          type: "menu",
          name: "home",
          title: "首页",
          path: "/home",
          component: "home/Index",
          icon: "HomeFilled",
          externalLinks: false,
          redirect: "",
          meta: "",
        },
      ];
      await this.routeRepository.save(routes); // 插入数据
    }
  }
}
