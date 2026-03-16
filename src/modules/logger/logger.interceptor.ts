import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Observable, tap, catchError, throwError, finalize } from 'rxjs';
import { LoggerWhiteList } from '@/config/whiteList';
import { Request } from 'express';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const whiteListStartsWith: string[] = LoggerWhiteList.whiteListStartsWith;
    const whiteListExact: string[] = LoggerWhiteList.whiteListExact;

    const request: Request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    request.startTime = Date.now();

    const url: string = request.url || '';
    if (
      whiteListStartsWith.some((prefix) => url.startsWith(prefix)) ||
      whiteListExact.includes(url)
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        this.loggerService.create(request, data, response.statusCode.toString());
      }),
      catchError((error) => {
        const statusCode = error.status || response.statusCode || 500;
        this.loggerService.create(request, error.message || 'Error', statusCode.toString());
        return throwError(() => error);
      }),
      finalize(() => {
        if (!response.headersSent && response.statusCode) {
          const statusCode = response.statusCode.toString();
          if (parseInt(statusCode, 10) >= 400) {
            this.loggerService.create(request, `Request completed with status ${statusCode}`, statusCode);
          }
        }
      })
    );
  }
}
