import { ApiProperty } from '@nestjs/swagger';
import { ApiResultWrapperDto } from '@/common/dto/base';

/** 通知信息响应DTO */
export class NoticeResponseDto {
  @ApiProperty({ description: '通知ID', example: '1' })
  id: string;

  @ApiProperty({ description: '指定角色权限', example: 'admin,dev', required: false })
  roleKeys?: string;

  @ApiProperty({ description: '用户id', example: '1,2,3', required: false })
  userIds?: string;

  @ApiProperty({ description: '标题', example: '系统通知' })
  title: string;

  @ApiProperty({ description: '内容', example: '系统维护通知', required: false })
  content?: string;

  @ApiProperty({ description: '指定时间', example: '2024-01-01', required: false })
  specifyTime?: Date;

  @ApiProperty({ description: '标记已读用户id', example: '1,2', required: false })
  READUserIds?: string;

  @ApiProperty({ description: '排序', example: 1 })
  sort: number;

  @ApiProperty({ description: '状态 0禁用 1启用', example: 1 })
  status: number;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date | string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date | string;
}

/** 通知信息响应包装 DTO */
export class NoticeResponseWrapperDto extends ApiResultWrapperDto<NoticeResponseDto> {
  @ApiProperty({ description: '响应数据', type: NoticeResponseDto })
  declare data: NoticeResponseDto;
}

/** 通知列表响应包装 DTO */
export class NoticeListResponseWrapperDto extends ApiResultWrapperDto<NoticeResponseDto[]> {
  @ApiProperty({ description: '响应数据', type: [NoticeResponseDto] })
  declare data: NoticeResponseDto[];
}