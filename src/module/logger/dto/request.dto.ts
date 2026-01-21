import { FindByParameter, PageByParameter } from '@/common/dto/base';
import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/** 分页查询日志请求DTO */
export class FindLogDtoByPage extends PartialType(IntersectionType(FindByParameter, PageByParameter)) {}
