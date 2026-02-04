import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@/modules/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Role } from '@/modules/roles/entities/role.entity';

@Module({
  imports: [
    // 仅引入 JwtModule，不绑定默认密钥，在使用的地方使用，需要兼容多个平台使用的密钥不同
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, Role]),
    forwardRef(() => UsersModule), // 使用 forwardRef 解决循环依赖
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
