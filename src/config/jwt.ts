export interface JwtConfig {
  /** token密钥 长度16 不同平台需要配置不同的密钥 */
  secret: string;
  /** token过期时间 可以根据不同的平台配置不同的过期时间 */
  jwt_expires_in: string;
  /** 刷新token过期时间 可以根据不同的平台配置不同的过期时间 */
  jwt_refresh_expires_in: string;
}

/**
 * 获取平台对应的 JWT 配置
 * @param {string} platform 平台标识字符串(admin/web/app/mini)
 * @returns {JwtConfig} 平台对应的 JWT 配置
 */
export function getPlatformJwtConfig(platform: string = 'admin'): JwtConfig | undefined {
  const configs = {
    admin: {
      secret: process.env.JWT_ADMIN_SECRET || 'vAT6Syz5kWD64I63',
      jwt_expires_in: process.env.JWT_ADMIN_EXPIRES_IN || '3600000',
      jwt_refresh_expires_in: process.env.JWT_ADMIN_REFRESH_EXPIRES_IN || '86400000',
    },
    web: {
      secret: process.env.JWT_WEB_SECRET || 'vAT6Syz5kWD64I63',
      jwt_expires_in: process.env.JWT_WEB_EXPIRES_IN || '3600000',
      jwt_refresh_expires_in: process.env.JWT_WEB_REFRESH_EXPIRES_IN || '86400000',
    },
    app: {
      secret: process.env.JWT_APP_SECRET || 'vAT6Syz5kWD64I63',
      jwt_expires_in: process.env.JWT_APP_EXPIRES_IN || '3600000',
      jwt_refresh_expires_in: process.env.JWT_APP_REFRESH_EXPIRES_IN || '86400000',
    },
    mini: {
      secret: process.env.JWT_MINI_SECRET || 'vAT6Syz5kWD64I63',
      jwt_expires_in: process.env.JWT_MINI_EXPIRES_IN || '3600000',
      jwt_refresh_expires_in: process.env.JWT_MINI_REFRESH_EXPIRES_IN || '86400000',
    },
  };
  return configs[platform];
}
