import { Module, OnModuleInit } from "@nestjs/common";
import { CacheService } from "@/common/service/cache.service";
import { initCacheInstances } from "@/config/nodeCache";

@Module({})
export class CacheInitModule implements OnModuleInit {
  constructor(private readonly cacheService: CacheService) {}

  onModuleInit() {
    initCacheInstances(this.cacheService);
  }
}
