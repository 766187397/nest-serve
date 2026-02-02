import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { bcryptService } from '@/common/utils/bcrypt-hash';
import { User } from '@/module/users/entities/user.entity';
import { Role } from '@/module/roles/entities/role.entity';
import { Route } from '@/module/routes/entities/route.entity';
import { Dictionary } from '@/module/dictionary/entities/dictionary.entity';
import { DictionaryItem } from '@/module/dictionary/entities/dictionaryItem.entity';
import { Email } from '@/module/email/entities/email.entity';
import { Notice } from '@/module/notice/entities/notice.entity';
import { Schedule } from '@/module/schedule/entities/schedule.entity';
import { ScheduleLog } from '@/module/schedule/entities/schedule-log.entity';

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

    /** 字典项 */
    @InjectRepository(DictionaryItem)
    private readonly dictionaryItemRepository: Repository<DictionaryItem>,

    /** 邮箱 */
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,

    /** 通知公告 */
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,

    /** 定时任务 */
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,

    /** 定时任务日志 */
    @InjectRepository(ScheduleLog)
    private readonly scheduleLogRepository: Repository<ScheduleLog>
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoutes();
    await this.seedRoles();
    await this.seedUsers();
    await this.seedDictionary();
    await this.seedEmails();
    await this.seedNotice();
    await this.seedSchedules();
  }

  /** 用户数据信息 */
  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count === 0) {
      // 如果没有用户，插入默认数据
      const password = await bcryptService.encryptStr('123456');
      const admin = await this.roleRepository.findOne({
        where: { roleKey: 'admin' },
      }); // 获取角色
      const web = await this.roleRepository.findOne({
        where: { roleKey: 'web' },
      }); // 获取角色
      const defaultData = [
        {
          account: 'admin',
          nickName: '管理员',
          password,
          phone: '18888888888',
          email: '766187397@qq.com',
          sex: '0',
          platform: 'admin',
          roles: admin ? [admin] : [],
        },
        {
          account: 'test',
          nickName: '测试用户',
          phone: '18333333333',
          email: 'test@example.com',
          password,
          sex: '0',
          platform: 'web',
          roles: web ? [web] : [],
        },
      ];

      const users = defaultData.map((item) => this.userRepository.create(item));
      await this.userRepository.save(users); // 插入数据
    }
  }

  /** 角色数据信息 */
  private async seedRoles() {
    const count = await this.roleRepository.count();
    if (count === 0) {
      const route1 = await this.routeRepository.find({
        where: { platform: 'admin' },
      }); // 获取路由
      const route2 = await this.routeRepository.find({
        where: { platform: 'web' },
      }); // 获取路由
      // 如果没有角色，插入默认数据
      const defaultData = [
        {
          name: '超级管理员',
          roleKey: 'admin',
          description: '拥有所有权限',
          platform: 'admin',
          routes: route1,
        },
        {
          name: '普通用户',
          roleKey: 'web',
          description: '拥有所有权限',
          platform: 'web',
          routes: route2,
        },
      ];
      const roles = defaultData.map((item) => this.roleRepository.create(item));
      await this.roleRepository.save(roles); // 插入数据
    }
  }

  /** 路由数据信息 */
  private async seedRoutes() {
    const count = await this.routeRepository.count();
    if (count === 0) {
      //#region admin路由数据
      // 首页
      const adminHomeData = this.routeRepository.create({
        platform: 'admin',
        type: 'menu',
        name: 'home',
        title: '首页',
        path: '/home',
        component: 'home/Index',
        icon: 'iconfont icon-head',
        externalLinks: false,
        redirect: '',
        meta: '',
        sort: 9,
      });

      await this.routeRepository.save(adminHomeData);

      // 系统管理
      const adminSystemData = this.routeRepository.create({
        platform: 'admin',
        type: 'menu',
        name: 'system',
        title: '系统管理',
        path: '/system',
        icon: 'iconfont icon-settings',
        externalLinks: false,
        redirect: '/system/user',
        meta: '',
        sort: 8,
      });
      const adminSystem = await this.routeRepository.save(adminSystemData);

      // 路由管理
      const adminRouteData = this.routeRepository.create({
        platform: 'admin',
        type: 'menu',
        name: 'route',
        title: '路由管理',
        path: '/system/route',
        icon: 'iconfont icon-route',
        externalLinks: false,
        redirect: '/system/route/admin',
        meta: '',
        parent: adminSystem,
        sort: 7,
      });
      const adminRoute = await this.routeRepository.save(adminRouteData);

      // 路由页面
      const adminRoutePageData = this.routeRepository.create([
        {
          platform: 'admin',
          type: 'menu',
          name: 'RouteAdmin',
          title: '后台路由',
          path: '/system/route/admin',
          component: 'system/route/Admin',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: adminRoute,
          sort: 9,
        },
        {
          platform: 'admin',
          type: 'menu',
          name: 'RouteWeb',
          title: '前台路由',
          path: '/system/route/web',
          component: 'system/route/Web',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: adminRoute,
          sort: 8,
        },
      ]);
      await this.routeRepository.save(adminRoutePageData);

      // 用户管理
      const userData = this.routeRepository.create({
        platform: 'admin',
        type: 'menu',
        name: 'user',
        title: '用户管理',
        path: '/system/user',
        icon: 'iconfont icon-user',
        externalLinks: false,
        redirect: '/system/user/admin',
        meta: '',
        parent: adminSystem,
        sort: 9,
      });
      const user = await this.routeRepository.save(userData);

      // 用户页面
      const UserPageData = this.routeRepository.create([
        {
          platform: 'admin',
          type: 'menu',
          name: 'userAdmin',
          title: '后台用户',
          path: '/system/user/admin',
          component: 'system/user/Admin',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: user,
          sort: 9,
        },
        {
          platform: 'admin',
          type: 'menu',
          name: 'userWeb',
          title: '前台用户',
          path: '/system/user/web',
          component: 'system/user/Web',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: user,
          sort: 8,
        },
      ]);
      await this.routeRepository.save(UserPageData);

      // 角色管理
      const RoleData = this.routeRepository.create({
        platform: 'admin',
        type: 'menu',
        name: 'role',
        title: '角色管理',
        path: '/system/role',
        icon: 'iconfont icon-role',
        externalLinks: false,
        redirect: '/system/role/admin',
        meta: '',
        parent: adminSystem,
        sort: 8,
      });
      const role = await this.routeRepository.save(RoleData);

      // 角色页面
      const RolePageData = this.routeRepository.create([
        {
          platform: 'admin',
          type: 'menu',
          name: 'roleAdmin',
          title: '后台角色',
          path: '/system/role/admin',
          component: 'system/role/Admin',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: role,
          sort: 9,
        },
        {
          platform: 'admin',
          type: 'menu',
          name: 'roleWeb',
          title: '前台角色',
          path: '/system/role/web',
          component: 'system/role/Web',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: role,
          sort: 8,
        },
      ]);
      await this.routeRepository.save(RolePageData);

      // 通知公告
      const adminNoticeData = this.routeRepository.create({
        platform: 'admin',
        type: 'menu',
        name: 'notice',
        title: '通知公告管理',
        path: '/system/notice',
        icon: 'iconfont icon-notice',
        externalLinks: false,
        redirect: '/system/notice/admin',
        meta: '',
        parent: adminSystem,
        sort: 6,
      });

      const adminNotice = await this.routeRepository.save(adminNoticeData);

      // 通知公告页面
      const adminNoticePageData = this.routeRepository.create([
        {
          platform: 'admin',
          type: 'menu',
          name: 'noticeAdmin',
          title: '后台通知公告',
          path: '/system/notice/admin',
          component: 'system/notice/Admin',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: adminNotice,
          sort: 2,
        },
        {
          platform: 'admin',
          type: 'menu',
          name: 'noticeWeb',
          title: '前台通知公告',
          path: '/system/notice/web',
          component: 'system/notice/Web',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: adminNotice,
          sort: 1,
        },
      ]);

      await this.routeRepository.save(adminNoticePageData);

      // 数据字典
      const dictionaryData = this.routeRepository.create({
        platform: 'admin',
        type: 'menu',
        name: 'dictionary',
        title: '数据字典',
        path: '/system/dictionary',
        component: 'system/dictionary/Index',
        icon: 'iconfont icon-dict',
        externalLinks: false,
        redirect: '',
        meta: '',
        parent: adminSystem,
        sort: 5,
      });

      await this.routeRepository.save(dictionaryData);

      // 数据字典子页面
      const dictionaryDataChild = this.routeRepository.create({
        platform: 'admin',
        type: 'button',
        name: 'dictionaryChild',
        title: '数据字典项',
        path: '/system/dictionary/child',
        component: 'system/dictionary/Child',
        icon: '',
        externalLinks: false,
        redirect: '',
        meta: '',
        parent: adminSystem,
        sort: 5,
      });

      await this.routeRepository.save(dictionaryDataChild);

      // 附件管理
      const uploadData = this.routeRepository.create({
        platform: 'admin',
        type: 'menu',
        name: 'file',
        title: '附件管理',
        path: '/system/file',
        component: 'system/file/Index',
        icon: 'iconfont icon-annex',
        externalLinks: false,
        redirect: '',
        meta: '',
        parent: adminSystem,
        sort: 4,
      });

      await this.routeRepository.save(uploadData);

      // 日志管理
      const logData = this.routeRepository.create({
        platform: 'admin',
        type: 'menu',
        name: 'log',
        title: '日志管理',
        path: '/system/log',
        icon: 'iconfont icon-log',
        externalLinks: false,
        redirect: '/system/log/admin',
        meta: '',
        parent: adminSystem,
        sort: 1,
      });
      const log = await this.routeRepository.save(logData);

      // 日志页面
      const logPageData = this.routeRepository.create([
        {
          platform: 'admin',
          type: 'menu',
          name: 'logAdmin',
          title: '后台日志',
          path: '/system/log/admin',
          component: 'system/log/Admin',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: log,
          sort: 9,
        },
        {
          platform: 'admin',
          type: 'menu',
          name: 'logWeb',
          title: '前台日志',
          path: '/system/log/web',
          component: 'system/log/Web',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: log,
          sort: 8,
        },
      ]);
      await this.routeRepository.save(logPageData);

      // 邮箱模板管理
      const emailData = this.routeRepository.create({
        platform: 'admin',
        type: 'menu',
        name: 'email',
        title: '邮箱模板管理',
        path: '/system/email',
        icon: 'iconfont icon-email',
        externalLinks: false,
        redirect: '/system/email/admin',
        meta: '',
        parent: adminSystem,
        sort: 3,
      });
      const email = await this.routeRepository.save(emailData);

      // 邮箱模板页面
      const emailPageData = this.routeRepository.create([
        {
          platform: 'admin',
          type: 'menu',
          name: 'emailAdmin',
          title: '后台邮箱模板',
          path: '/system/email/admin',
          component: 'system/email/Admin',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: email,
          sort: 9,
        },
        {
          platform: 'admin',
          type: 'menu',
          name: 'emailWeb',
          title: '前台邮箱模板',
          path: '/system/email/web',
          component: 'system/email/Web',
          icon: '',
          externalLinks: false,
          redirect: '',
          meta: '',
          parent: email,
          sort: 8,
        },
      ]);
      await this.routeRepository.save(emailPageData);
      //#endregion

      //#region web路由数据
      const webHomeData = this.routeRepository.create({
        platform: 'web',
        type: 'menu',
        name: 'home',
        title: '首页',
        path: '/home',
        component: 'home/Index',
        icon: 'iconfont icon-head',
        externalLinks: false,
        redirect: '',
        meta: '',
        sort: 2,
      });
      await this.routeRepository.save(webHomeData);
      //#endregion
    }
  }

  /** 数据字典 */
  private async seedDictionary() {
    const count = await this.dictionaryRepository.count();
    if (count === 0) {
      // 插入字典类型
      const dictionariesData = [
        {
          type: 'platform',
          name: '平台',
          description: '平台',
        },
        {
          type: 'routeType',
          name: '路由类型',
          description: '路由类型（目录、菜单、按钮等）',
        },
        {
          type: 'publicState',
          name: '公共状态',
          description: '公共状态:State的具体值（启用禁用）',
        },
        {
          type: 'userSex',
          name: '用户性别',
          description: '用户性别:0未知 1男 2女',
        },
      ];
      const dictionaries = dictionariesData.map((item) => this.dictionaryRepository.create(item));
      const dictionaryList = await this.dictionaryRepository.save(dictionaries);

      // 插入字典项
      const dictionariesItemData = [
        {
          category: dictionaryList[0],
          label: '后台',
          value: 'admin',
          description: '后台平台标识',
        },
        {
          category: dictionaryList[0],
          label: 'web端',
          value: 'web',
          description: '前台平台标识',
        },
        {
          category: dictionaryList[1],
          label: '目录',
          value: 'catalogue',
          description: '路由类型：目录',
        },
        {
          category: dictionaryList[1],
          label: '菜单',
          value: 'menu',
          description: '路由类型：菜单',
        },
        {
          category: dictionaryList[1],
          label: '按钮',
          value: 'button',
          description: '路由类型：按钮',
        },
        {
          category: dictionaryList[2],
          label: '启用',
          value: '1',
          description: '公共状态：启用',
        },
        {
          category: dictionaryList[2],
          label: '禁用',
          value: '0',
          description: '公共状态：禁用',
        },
        {
          category: dictionaryList[3],
          label: '未知',
          value: '0',
          description: '用户性别:未知',
        },
        {
          category: dictionaryList[3],
          label: '男',
          value: '1',
          description: '用户性别:男',
        },
        {
          category: dictionaryList[3],
          label: '女',
          value: '2',
          description: '用户性别:女',
        },
      ];

      const dictionariesItem = dictionariesItemData.map((item) =>
        this.dictionaryItemRepository.create(item)
      );
      await this.dictionaryItemRepository.save(dictionariesItem); // 插入数据
    }
  }

  /** 邮箱模板 */
  private async seedEmails() {
    const count = await this.emailRepository.count();
    if (count === 0) {
      const emailData = [
        {
          type: 'logonCode',
          platform: 'admin',
          title: '验证码通知！',
          content:
            "<!DOCTYPE html><html lang='zh-CN'><head><meta charset='UTF-8'/><title>验证码通知</title><meta name='viewport'content='width=device-width, initial-scale=1.0'/><style>body{margin:0;padding:0;background-color:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}table{border-collapse:collapse;width:100%}.wrapper{background-color:#f4f4f4;width:100%;padding:20px 0}.main{max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)}.header{background-color:#007bff;color:#ffffff;padding:30px 40px;text-align:center}.header h1{margin:0;font-size:24px}.content{padding:30px 40px;color:#333333;font-size:16px;line-height:1.6}.content h2{color:#007bff;margin-top:0}.code{background-color:#eee;padding:4px 8px}.footer{background-color:#f9f9f9;color:#888888;font-size:12px;padding:20px 40px;text-align:center}.footer a{color:#007bff;text-decoration:none}@media screen and(max-width:600px){.content,.header,.footer{padding:20px}.cta-button{width:100%;text-align:center}}</style></head><body><div class='wrapper'><table role='presentation'><tr><td><div class='main'><div class='header'><h1>🚀验证码通知！</h1></div><div class='content'><h2>亲爱的用户，您好！</h2><p>您似乎正在尝试登录！这是您的验证码：<span class='code'>{code}</span>，有效期5分钟，请勿将验证码泄漏于他人。</p></div><div class='footer'><p>此邮件由系统自动发送，请勿直接回复。<br/>如需帮助，请联系<a href='mailto:766187397@qq.com'>766187397@qq.com</a></p></div></div></td></tr></table></div></body></html>",
        },
        {
          type: 'loginCode',
          platform: 'web',
          title: '验证码通知！',
          content:
            "<!DOCTYPE html><html lang='zh-CN'><head><meta charset='UTF-8'/><title>验证码通知</title><meta name='viewport'content='width=device-width, initial-scale=1.0'/><style>body{margin:0;padding:0;background-color:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}table{border-collapse:collapse;width:100%}.wrapper{background-color:#f4f4f4;width:100%;padding:20px 0}.main{max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)}.header{background-color:#007bff;color:#ffffff;padding:30px 40px;text-align:center}.header h1{margin:0;font-size:24px}.content{padding:30px 40px;color:#333333;font-size:16px;line-height:1.6}.content h2{color:#007bff;margin-top:0}.code{background-color:#eee;padding:4px 8px}.footer{background-color:#f9f9f9;color:#888888;font-size:12px;padding:20px 40px;text-align:center}.footer a{color:#007bff;text-decoration:none}@media screen and(max-width:600px){.content,.header,.footer{padding:20px}.cta-button{width:100%;text-align:center}}</style></head><body><div class='wrapper'><table role='presentation'><tr><td><div class='main'><div class='header'><h1>🚀验证码通知！</h1></div><div class='content'><h2>亲爱的用户，您好！</h2><p>您似乎正在尝试登录！这是您的验证码：<span class='code'>{code}</span>，有效期5分钟，请勿将验证码泄漏于他人。</p></div><div class='footer'><p>此邮件由系统自动发送，请勿直接回复。<br/>如需帮助，请联系<a href='mailto:766187397@qq.com'>766187397@qq.com</a></p></div></div></td></tr></table></div></body></html>",
        },
      ];

      const email = this.emailRepository.create(emailData);
      await this.emailRepository.save(email);
    }
  }

  /** 通知公告 */
  private async seedNotice() {
    const count = await this.noticeRepository.count();
    if (count === 0) {
      const noticeData = [
        {
          platform: 'admin',
          title: '系统通知',
          content: '不定期清空数据！！！',
          status: 2,
        },
      ];

      const notice = this.noticeRepository.create(noticeData);
      await this.noticeRepository.save(notice);
    }
  }

  /** 定时任务 */
  private async seedSchedules() {
    const count = await this.scheduleRepository.count();
    if (count === 0) {
      const scheduleData = [
        {
          platform: 'admin',
          name: '清理日志任务',
          description: '定期清理系统日志数据',
          cronExpression: '0 0 3 * *',
          jobName: 'deleteLogs',
          status: 1,
          timeout: 300,
          retryCount: 3,
          retryInterval: 60,
        },
      ];

      const schedules = scheduleData.map((item) => this.scheduleRepository.create(item));
      const savedSchedules = await this.scheduleRepository.save(schedules);

      const scheduleLogData = [
        {
          scheduleId: savedSchedules[0].id,
          executionTime: new Date(),
          executionStatus: 'success',
          duration: 100,
        },
      ];

      const scheduleLog = this.scheduleLogRepository.create(scheduleLogData);
      await this.scheduleLogRepository.save(scheduleLog);
    }
  }
}
