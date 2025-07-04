import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

class MessageDto {
  @ApiProperty({
    description: "角色",
    example: "user",
  })
  @IsString({ message: "角色不能为空" })
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: "内容",
    example: "你好",
  })
  @IsString({ message: "内容不能为空" })
  @IsNotEmpty()
  content: string;
}

export class ChatRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}

/** 生成图片DTO */
export class CreateImageDto {
  @ApiProperty({ description: "提示语" })
  @IsNotEmpty()
  @IsString({ message: "提示语不能为空" })
  prompt: string;

  @ApiProperty({ description: "图片尺寸" })
  @IsString({ message: "图片尺寸不能为空" })
  @IsIn(["1024x1024", "1024x2048", "1536x1024", "1536x2048", "2048x1152", "1152x2048"]) // 示例尺寸限制
  image_size: string;

  @ApiProperty({ description: "图片数量" })
  @IsNotEmpty()
  @IsNumber({}, { message: "图片数量不能为空" })
  batch_size: number;

  @ApiProperty({ description: "生成图片的步数" })
  @IsNotEmpty()
  @IsNumber({}, { message: "生成图片的步数不能为空" })
  @Max(50, { message: "匹配度不能大于50" })
  @Min(0, { message: "匹配度不能小于0" })
  num_inference_steps: number;

  @ApiProperty({ description: " 匹配度" })
  @IsNumber({}, { message: "匹配度不能为空" })
  @Max(20, { message: "匹配度不能大于20" })
  @Min(0, { message: "匹配度不能小于0" })
  guidance_scale: number;
}
