import * as nodeCache from "node-cache";
export const cacheTime = 2;
// 创建一个NodeCache实例，设置过期时间为60秒
export const cache = new nodeCache({ stdTTL: cacheTime * 60 });
