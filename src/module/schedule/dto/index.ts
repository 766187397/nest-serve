import { IntersectionType, PartialType } from '@nestjs/swagger';
import { FindByParameter, PageByParameter } from '@/common/dto/base';
import { CreateScheduleDto } from './create-schedule.dto';
import { UpdateScheduleDto } from './update-schedule.dto';

export class FindScheduleDtoByPage extends PartialType(
  IntersectionType(FindByParameter, PageByParameter)
) {
  name?: string;
}

export class FindScheduleLogDtoByPage extends PartialType(
  IntersectionType(FindByParameter, PageByParameter)
) {
  scheduleName?: string;
  scheduleId?: string;
  status?: string;
}

export { CreateScheduleDto, UpdateScheduleDto };
