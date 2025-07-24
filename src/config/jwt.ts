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
export function getPlatformJwtConfig(platform: string = "admin"): JwtConfig | undefined {
  const configs = {
    admin: {
      secret: "vAT6Syz5kWD64I63",
      jwt_expires_in: "3600000",
      jwt_refresh_expires_in: "86400000",
    },
    web: {
      secret: "vAT6Syz5kWD64I63",
      jwt_expires_in: "3600000",
      jwt_refresh_expires_in: "86400000",
    },
    app: {
      secret: "vAT6Syz5kWD64I63",
      jwt_expires_in: "3600000",
      jwt_refresh_expires_in: "86400000",
    },
    mini: {
      secret: "vAT6Syz5kWD64I63",
      jwt_expires_in: "3600000",
      jwt_refresh_expires_in: "86400000",
    },
  };
  return configs[platform];
}
