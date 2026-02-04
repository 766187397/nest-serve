import { ApiProperty } from '@nestjs/swagger';

export class SetGlobalDegradationLevelDto {
  @ApiProperty({ description: '降级级别', example: 1 })
  level: number;
}
