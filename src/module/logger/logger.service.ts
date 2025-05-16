import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class LoggerService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  info(message: string, options?: any) {
    this.logger.info(message, options);
  }
  error(message: string, options?: any) {
    this.logger.error(message, options);
  }
  warn(message: string, options?: any) {
    this.logger.warn(message, options);
  }
  debug(message: string, options?: any) {
    this.logger.debug(message, options);
  }
}
