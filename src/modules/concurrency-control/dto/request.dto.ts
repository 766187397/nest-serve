import { ApiProperty } from '@nestjs/swagger';

/** 设置全局降级级别请求DTO */
export class SetGlobalDegradationLevelDto {
  @ApiProperty({ description: '降级级别', example: 1 })
  level: number;
}
