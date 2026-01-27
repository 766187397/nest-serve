import { Module } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { TraceService } from './trace.service';
import { AlertService } from './alert.service';
import { PerformanceMonitorController } from './performance-monitor.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from '@/module/email/email.module';
import { PerformanceMonitorInterceptor } from '@/common/interceptor/performance-monitor.interceptor';

@Module({
  imports: [ScheduleModule.forRoot(), EmailModule],
  controllers: [PerformanceMonitorController],
  providers: [
    PrometheusService,
    TraceService,
    AlertService,
    PerformanceMonitorInterceptor,
  ],
  exports: [
    PrometheusService,
    TraceService,
    AlertService,
    PerformanceMonitorInterceptor,
  ],
})
export class PerformanceMonitorModule {}
