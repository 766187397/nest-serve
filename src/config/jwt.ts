export interface JwtConfig {
  secret: string;
  jwt_expires_in: string;
  jwt_refresh_expires_in: string;
}

/**
 * 获取平台对应的 JWT 配置
 * @param {string} platform 平台标识字符串(admin/web/app/mini)
 * @returns {JwtConfig} 平台对应的 JWT 配置
 */
export function getPlatformJwtConfig(platform: string = "admin"): JwtConfig | undefined {
  const configs = {
    admin: {
      secret: process.env.JWT_SECRET_ADMIN,
      jwt_expires_in: process.env.JWT_EXPIRES_IN_ADMIN,
      jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN_ADMIN,
    },
    web: {
      secret: process.env.JWT_SECRET_WEB,
      jwt_expires_in: process.env.JWT_EXPIRES_IN_WEB,
      jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN_WEB,
    },
    app: {
      secret: process.env.JWT_SECRET_APP,
      jwt_expires_in: process.env.JWT_EXPIRES_IN_APP,
      jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN_APP,
    },
    mini: {
      secret: process.env.JWT_SECRET_MINI,
      jwt_expires_in: process.env.JWT_EXPIRES_IN_MINI,
      jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN_MINI,
    },
  };
  return configs[platform];
}
