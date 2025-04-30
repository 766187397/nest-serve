import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { TusController, CustomizeTusController } from "./tus.controller";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Upload } from "./entities/upload.entity";
import { FileUploadService } from "@/config/multer";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../../", FileUploadService.rootPath),
      serveRoot: FileUploadService.serveRoot, // 主文件访问路径
      serveStaticOptions: {
        maxAge: "1y", // 设置缓存时间
      },
    }),
    TypeOrmModule.forFeature([Upload]),
  ],
  controllers: [UploadController, TusController, CustomizeTusController],
  providers: [UploadService],
})
export class UploadModule {}
