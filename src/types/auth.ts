import type { User } from '@/modules/users/entities/user.entity';

/**
 * JWT 载荷类型
 * @description 定义 JWT token 中包含的用户信息结构
 */
export type JwtPayload = User;
