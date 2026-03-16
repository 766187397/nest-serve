import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { getMulterOptions } from '@/config/multer';

export function MulterConfigUpload() {
  const configService = new ConfigService();
  const multerOptions = getMulterOptions(configService);
  return applyDecorators(UseInterceptors(FileInterceptor('file', multerOptions)));
}
