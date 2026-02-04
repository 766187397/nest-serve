import { Controller, Get, Query, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PrometheusService } from './prometheus.service';
import { TraceService } from './trace.service';
import { AlertService } from './alert.service';
import {
  GetMetricsQueryDto,
  GetTracesQueryDto,
  GetTracesQueryDtoByPage,
  GetAlertsQueryDto,
  ResolveAlertDto,
  CreateAlertRuleDto,
  MetricsResponseDto,
  TraceContextResponseDto,
  SpanResponseDto,
  AlertResponseDto,
  AlertRuleResponseDto,
  PerformanceStatusResponseDto,
} from './dto';
import { PageByParameter } from '@/common/dto/base';
import { PageApiResult } from '@/types/public';
import { ApiResult } from '@/common/utils/result';

@ApiTags('性能监控')
@Controller('performance-monitor')
export class PerformanceMonitorController {
  constructor(
    private readonly prometheusService: PrometheusService,
    private readonly traceService: TraceService,
    private readonly alertService: AlertService,
  ) {}

  @Get('metrics')
  @ApiOperation({ summary: '获取Prometheus指标' })
  @ApiResponse({ status: 200, type: MetricsResponseDto })
  @ApiQuery({ name: 'name', required: false, description: '指标名称' })
  async getMetrics(@Query() query: GetMetricsQueryDto) {
    const metrics = this.prometheusService.getMetrics();
    return ApiResult.success({
      data: {
        metrics,
        count: metrics.split('\n').filter((line) => line.trim()).length,
      },
    });
  }

  @Get('metrics/reset')
  @ApiOperation({ summary: '重置所有指标' })
  @ApiResponse({ status: 200, description: '指标已重置' })
  async resetMetrics() {
    this.prometheusService.resetMetrics();
    return ApiResult.success({
      message: 'All metrics have been reset',
    });
  }

  @Get('traces/current')
  @ApiOperation({ summary: '获取当前追踪上下文' })
  @ApiResponse({ status: 200, type: TraceContextResponseDto })
  async getCurrentTrace() {
    const trace = this.traceService.getCurrentTrace();
    return ApiResult.success({
      data: trace,
    });
  }

  @Get('traces/active')
  @ApiOperation({ summary: '获取活跃的追踪' })
  @ApiResponse({ status: 200, type: [SpanResponseDto] })
  async getActiveTraces(@Query() query: GetTracesQueryDtoByPage) {
    const page = parseInt(query.page || '1', 10);
    const pageSize = parseInt(query.pageSize || '20', 10);
    const allTraces = this.traceService.getActiveSpans();
    const total = allTraces.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const traces = allTraces.slice(startIndex, endIndex);

    return ApiResult.success<PageApiResult<SpanResponseDto[]>>({
      data: {
        data: traces,
        total,
        totalPages,
        page,
        pageSize,
      },
    });
  }

  @Get('traces/completed')
  @ApiOperation({ summary: '获取已完成的追踪' })
  @ApiResponse({ status: 200, type: [SpanResponseDto] })
  async getCompletedTraces(@Query() query: GetTracesQueryDtoByPage) {
    let traces = this.traceService.getCompletedSpans();

    if (query.traceId) {
      traces = traces.filter((trace) => trace.traceId === query.traceId);
    }

    if (query.operationName) {
      traces = traces.filter((trace) => trace.operationName === query.operationName);
    }

    if (query.startTime !== undefined && query.startTime !== null) {
      traces = traces.filter((trace) => trace.startTime >= query.startTime!);
    }

    if (query.endTime !== undefined && query.endTime !== null) {
      traces = traces.filter((trace) => trace.endTime && trace.endTime <= query.endTime!);
    }

    if (query.minDuration !== undefined && query.minDuration !== null) {
      traces = traces.filter((trace) => trace.duration && trace.duration >= query.minDuration!);
    }

    if (query.maxDuration !== undefined && query.maxDuration !== null) {
      traces = traces.filter((trace) => trace.duration && trace.duration <= query.maxDuration!);
    }

    const page = parseInt(query.page || '1', 10);
    const pageSize = parseInt(query.pageSize || '20', 10);
    const total = traces.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTraces = traces.slice(startIndex, endIndex);

    return ApiResult.success<PageApiResult<SpanResponseDto[]>>({
      data: {
        data: paginatedTraces,
        total,
        totalPages,
        page,
        pageSize,
      },
    });
  }

  @Post('traces/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清除已完成的追踪' })
  @ApiResponse({ status: 200, description: '已完成的追踪已清除' })
  async clearCompletedTraces() {
    this.traceService.clearCompletedSpans();
    return ApiResult.success({
      message: 'Completed traces have been cleared',
    });
  }

  @Get('alerts/active')
  @ApiOperation({ summary: '获取活跃的告警' })
  @ApiResponse({ status: 200, type: [AlertResponseDto] })
  @ApiQuery({ name: 'type', required: false, description: '告警类型' })
  @ApiQuery({ name: 'severity', required: false, description: '严重程度' })
  async getActiveAlerts(@Query() query: GetAlertsQueryDto) {
    let alerts = this.alertService.getActiveAlerts();

    if (query.type) {
      alerts = alerts.filter((alert) => alert.type === query.type);
    }

    if (query.severity) {
      alerts = alerts.filter((alert) => alert.severity === query.severity);
    }

    return ApiResult.success({
      data: alerts,
    });
  }

  @Get('alerts/history')
  @ApiOperation({ summary: '获取告警历史' })
  @ApiResponse({ status: 200, type: [AlertResponseDto] })
  @ApiQuery({ name: 'type', required: false, description: '告警类型' })
  async getAlertHistory(@Query() query: GetAlertsQueryDto) {
    const alerts = this.alertService.getAlertHistory(query.type);
    return ApiResult.success({
      data: alerts,
    });
  }

  @Post('alerts/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '解决告警' })
  @ApiResponse({ status: 200, description: '告警已解决' })
  async resolveAlert(@Body() body: ResolveAlertDto) {
    this.alertService.resolveAlert(body.alertId);
    return ApiResult.success({
      message: `Alert ${body.alertId} has been resolved`,
    });
  }

  @Post('alerts/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清除已解决的告警' })
  @ApiResponse({ status: 200, description: '已解决的告警已清除' })
  async clearResolvedAlerts() {
    this.alertService.clearResolvedAlerts();
    return ApiResult.success({
      message: 'Resolved alerts have been cleared',
    });
  }

  @Get('status')
  @ApiOperation({ summary: '获取性能监控状态' })
  @ApiResponse({ status: 200, type: PerformanceStatusResponseDto })
  async getStatus() {
    const activeTraces = this.traceService.getActiveSpans().length;
    const completedTraces = this.traceService.getCompletedSpans().length;
    const activeAlerts = this.alertService.getActiveAlerts().length;
    const alertHistory = this.alertService.getAlertHistory().length;

    return ApiResult.success({
      data: {
        activeTraces,
        completedTraces,
        activeAlerts,
        alertHistory,
        metricsCount: 12,
      },
    });
  }
}
