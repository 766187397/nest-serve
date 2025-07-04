import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

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
