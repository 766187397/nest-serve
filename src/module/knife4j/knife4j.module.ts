import { Module } from "@nestjs/common";
import { Knife4jService } from "./knife4j.service";
import { Knife4jController } from "./knife4j.controller";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

@Module({
  imports: [
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, "../../../", "knife4j/index.html"),
        serveRoot: "/doc", // 主文件访问路径
        serveStaticOptions: {
          maxAge: "1y", // 设置缓存时间
        },
      },
      {
        rootPath: join(__dirname, "../../../", "knife4j/"),
        serveRoot: "/", // 设置静态文件访问路径
        serveStaticOptions: {
          maxAge: "1y", // 设置缓存时间
        },
      }
    ),
  ],
  controllers: [Knife4jController],
  providers: [Knife4jService],
})
export class Knife4jModule {}
