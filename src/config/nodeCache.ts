import * as nodeCache from "node-cache";
export const cacheTime = 5;
/** 邮箱缓存实例 */
export const emailCache = new nodeCache({ stdTTL: cacheTime * 60 });

/** 图片人机校验缓存实例 */
export const svgCache = new nodeCache({ stdTTL: 5 * 60 });
