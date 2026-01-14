/**
 * JWT 载荷类型
 * @description 定义 JWT token 中包含的用户信息结构
 */
export interface JwtPayload {
  /** 用户账号 */
  account: string;
  /** 用户ID */
  id: string;
  /** 用户昵称 */
  nickName?: string;
  /** 平台标识 */
  platform?: string;
  /** 其他扩展字段 */
  [key: string]: unknown;
}
