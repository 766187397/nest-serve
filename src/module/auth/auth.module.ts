import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "@/module/users/users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get("JWT_SECRET"),
        signOptions: { expiresIn: config.get("JWT_EXPIRES_IN") + "h" }, // 全局的时长配置
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule), // 使用 forwardRef 解决循环依赖
  ],
  controllers: [],
  providers: [],
  exports: [JwtModule],
})
export class AuthModule {}
