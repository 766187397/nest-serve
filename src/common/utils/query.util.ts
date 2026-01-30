/**
 * 查询条件处理工具
 * @author admin
 * @date 2026-01-14
 */

/**
 * 处理平台查询条件
 * @param {string | undefined} requestPlatform 请求头中的平台标识
 * @param {string | undefined} [queryPlatform] 查询条件中的平台标识（仅admin平台可用）
 * @returns {string} 最终使用的平台标识
 * @description 当请求平台为admin且提供了queryPlatform参数时，使用queryPlatform；否则使用requestPlatform
 */
export function handlePlatformQuery(
  requestPlatform: string | undefined,
  queryPlatform?: string | undefined
): string {
  // 定义管理员平台标识，可根据需要修改
  const ADMIN_PLATFORM = 'admin';

  // 如果请求平台是admin且提供了查询平台参数，则使用查询平台参数
  if (requestPlatform === ADMIN_PLATFORM && queryPlatform) {
    return queryPlatform;
  }

  // 否则使用请求头中的平台标识
  return requestPlatform || '';
}
