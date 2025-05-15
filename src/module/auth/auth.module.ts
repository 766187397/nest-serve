import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "@/module/users/users.module";
@Module({
  imports: [
    // 仅引入 JwtModule，不绑定默认密钥，在使用的地方使用，需要兼容多个平台使用的密钥不同
    JwtModule.register({}),
    forwardRef(() => UsersModule), // 使用 forwardRef 解决循环依赖
  ],
  controllers: [],
  providers: [],
  exports: [JwtModule],
})
export class AuthModule {}
