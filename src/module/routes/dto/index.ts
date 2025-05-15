import { CreateBaseDto, FindByParameter } from "@/common/dto/base";
import { PartialType } from "@nestjs/swagger";

export class CreateRouteDto extends CreateBaseDto {}

export class UpdateRouteDto extends PartialType(CreateRouteDto) {}
