import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusService } from '@/module/performance-monitor/prometheus.service';
import { TraceService } from '@/module/performance-monitor/trace.service';

@Injectable()
export class PerformanceMonitorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceMonitorInterceptor.name);

  constructor(
    private readonly prometheusService: PrometheusService,
    private readonly traceService: TraceService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const path = request.route?.path || request.path;

    const startTime = Date.now();

    this.prometheusService.setGauge('http_requests_in_progress', 1, { method, path });

    this.traceService.startTrace(`${method} ${path}`, {
      method,
      path,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.prometheusService.incrementCounter('http_requests_total', 1, { method, path, status_code: statusCode.toString() });
          this.prometheusService.observeHistogram('http_request_duration_seconds', duration / 1000, { method, path });
          this.prometheusService.setGauge('http_requests_in_progress', 0, { method, path });

          if (statusCode >= 400) {
            this.prometheusService.incrementCounter('http_errors_total', 1, {
              method,
              path,
              error_type: statusCode >= 500 ? 'server_error' : 'client_error',
            });
          }

          this.traceService.addTag('status_code', statusCode.toString());
          this.traceService.addLog('info', `Request completed in ${duration}ms`);
          this.traceService.endTrace();
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.prometheusService.incrementCounter('http_requests_total', 1, { method, path, status_code: statusCode.toString() });
          this.prometheusService.incrementCounter('http_errors_total', 1, {
            method,
            path,
            error_type: error.name || 'unknown_error',
          });
          this.prometheusService.observeHistogram('http_request_duration_seconds', duration / 1000, { method, path });
          this.prometheusService.setGauge('http_requests_in_progress', 0, { method, path });

          this.traceService.addTag('error', error.message);
          this.traceService.addTag('error_type', error.name);
          this.traceService.addLog('error', `Request failed: ${error.message}`);
          this.traceService.endTrace();

          this.logger.error(`Request failed: ${method} ${path} - ${error.message}`);
        },
      }),
    );
  }
}
