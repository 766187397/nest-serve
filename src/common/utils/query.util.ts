import { FindOperator, In } from 'typeorm';

type PlatformResult = string | FindOperator<string> | undefined;

export function handlePlatformQuery(
  requestPlatform: string | undefined,
  queryPlatform?: string | undefined,
  isAdminCanQueryAll: boolean = false
): PlatformResult {
  const ADMIN_PLATFORM = 'admin';

  if (requestPlatform === ADMIN_PLATFORM) {
    if (queryPlatform) {
      return queryPlatform;
    }
    if (isAdminCanQueryAll) {
      return undefined;
    }
    return requestPlatform;
  }

  return requestPlatform || '';
}
