import { DocumentBuilder } from "@nestjs/swagger";
export class SwaggerConfig {
  static swaggerOptions = new DocumentBuilder()
    .setTitle("NestJS API") // API 文档的标题
    .setDescription("NestJS API description") // API 文档的描述
    .setVersion("1.0") // API 的版本
    .addServer(global.url, "项目地址")
    .build();
}
