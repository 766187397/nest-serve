import { Module } from '@nestjs/common';
import { ExceptionTestController } from './exception-test.controller';

@Module({
  controllers: [ExceptionTestController],
})
export class ExceptionTestModule {}
