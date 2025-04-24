import * as dotenv from 'dotenv';
// 根据环境加载对应的 .env 文件
const envFilePath = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFilePath });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || 'localhost';
  const url = `http://${host}:${port}`;
  global.url = url;
  await app.listen(port).then((res) => {
    console.log(`当前环境为：${envFilePath}`);
    console.log(`server to ${url}`);
    console.log(`swagger to ${url}/swagger`);
    console.log(`knife4j to ${url}/api/doc?v=1`);
  });
}
bootstrap();
