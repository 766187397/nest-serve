import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { bcryptService } from "@/common/utils/bcrypt-hash";
import { User } from "@/module/users/entities/user.entity";
import { Role } from "@/module/roles/entities/role.entity";
import { Route } from "@/module/routes/entities/route.entity";
import { Dictionary } from "@/module/dictionary/entities/dictionary.entity";
import { DictionaryItem } from "@/module/dictionary/entities/dictionaryItem.entity";

@Injectable()
export class defaultData implements OnApplicationBootstrap {
  constructor(
    /** 用户 */
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    /** 角色 */
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    /** 路由 */
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,

    /** 字典 */
    @InjectRepository(Dictionary)
    private readonly dictionaryRepository: Repository<Dictionary>,

    /** 字典项*/
    @InjectRepository(DictionaryItem)
    private readonly dictionaryItemRepository: Repository<DictionaryItem>
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoutes();
    await this.seedRoles();
    await this.seedUsers();

    await this.seedDictionary();
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
      // 系统管理
      const system = await this.routeRepository.save({
        platform: "admin",
        type: "menu",
        name: "system",
        title: "系统管理",
        path: "/system",
        icon: "Setting",
        externalLinks: false,
        redirect: "/system/route",
        meta: "",
      });

      // 路由管理
      const route = await this.routeRepository.save({
        platform: "admin",
        type: "menu",
        name: "route",
        title: "路由管理",
        path: "/system/route",
        icon: "Menu",
        externalLinks: false,
        redirect: "/system/route/admin",
        meta: "",
        parent: system,
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
          name: "RouteAdmin",
          title: "admin路由",
          path: "/system/route/admin",
          component: "system/route/Admin",
          icon: "",
          externalLinks: false,
          redirect: "",
          meta: "",
          parent: route,
        },
        {
          platform: "admin",
          type: "menu",
          name: "RouteWeb",
          path: "/system/route/web",
          component: "system/route/Web",
          icon: "",
          externalLinks: false,
          redirect: "",
          meta: "",
          parent: route,
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

  /** 数据字典 */
  private async seedDictionary() {
    const count = await this.dictionaryRepository.count();
    if (count === 0) {
      const dictionaries = [
        {
          type: "platform",
          name: "平台",
          description: "平台",
        },
        {
          type: "routeType",
          name: "路由类型",
          description: "路由类型（目录、菜单、按钮等）",
        },
        {
          type: "publicState",
          name: "公共状态",
          description: "公共状态:State的具体值（启用禁用）",
        },
      ];
      // 插入字段项目数据
      const dictionaryList = await this.dictionaryRepository.save(dictionaries);

      const dictionariesItem = [
        {
          category: dictionaryList[0],
          label: "后台",
          value: "admin",
          description: "后台平台标识",
        },
        {
          category: dictionaryList[0],
          label: "web端",
          value: "web",
          description: "前台平台标识",
        },
        {
          category: dictionaryList[1],
          label: "目录",
          value: "catalogue",
          description: "路由类型：目录",
        },
        {
          category: dictionaryList[1],
          label: "菜单",
          value: "menu",
          description: "路由类型：菜单",
        },
        {
          category: dictionaryList[1],
          label: "按钮",
          value: "button",
          description: "路由类型：按钮",
        },
        {
          category: dictionaryList[2],
          label: "启用",
          value: "1",
          description: "公共状态：启用",
        },
        {
          category: dictionaryList[2],
          label: "禁用",
          value: "0",
          description: "公共状态：禁用",
        },
      ];

      await this.dictionaryItemRepository.save(dictionariesItem); // 插入数据
    }
  }
}
