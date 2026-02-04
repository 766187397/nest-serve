import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TusController, CustomizeTusController } from './tus.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './entities/upload.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMulterConfig } from '@/config/multer';

@Module({
  imports: [
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const multerConfig = getMulterConfig(configService);
        return [
          {
            rootPath: join(__dirname, '../../../', multerConfig.rootPath),
            serveRoot: multerConfig.serveRoot,
            serveStaticOptions: {
              maxAge: '1y',
            },
          },
        ];
      },
    }),
    TypeOrmModule.forFeature([Upload]),
  ],
  controllers: [UploadController, TusController, CustomizeTusController],
  providers: [UploadService],
})
export class UploadModule {}
