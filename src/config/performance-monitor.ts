export interface PrometheusConfig {
  enabled: boolean;
  defaultLabels: {
    service: string;
    environment: string;
  };
  metricsPath: string;
  collectDefaultMetrics: boolean;
}

export interface TraceConfig {
  enabled: boolean;
  serviceName: string;
  sampleRate: number;
  maxTraceIdLength: number;
}

export interface AlertConfig {
  enabled: boolean;
  thresholds: {
    qps: number;
    responseTime: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
  };
  alertChannels: {
    email: boolean;
    webhook: boolean;
  };
  webhookUrl?: string;
}

export interface PerformanceMonitorConfig {
  prometheus: PrometheusConfig;
  trace: TraceConfig;
  alert: AlertConfig;
}

export function getPerformanceMonitorConfig(configService: any): PerformanceMonitorConfig {
  return {
    prometheus: {
      enabled: configService.get('PROMETHEUS_ENABLED', 'true') === 'true',
      defaultLabels: {
        service: configService.get('SERVICE_NAME', 'nest-serve'),
        environment: configService.get('NODE_ENV', 'dev'),
      },
      metricsPath: configService.get('PROMETHEUS_METRICS_PATH', '/metrics'),
      collectDefaultMetrics: configService.get('PROMETHEUS_COLLECT_DEFAULT', 'true') === 'true',
    },
    trace: {
      enabled: configService.get('TRACE_ENABLED', 'true') === 'true',
      serviceName: configService.get('SERVICE_NAME', 'nest-serve'),
      sampleRate: parseFloat(configService.get('TRACE_SAMPLE_RATE', '0.1')),
      maxTraceIdLength: parseInt(configService.get('TRACE_MAX_ID_LENGTH', '32'), 10),
    },
    alert: {
      enabled: configService.get('ALERT_ENABLED', 'true') === 'true',
      thresholds: {
        qps: parseInt(configService.get('ALERT_QPS_THRESHOLD', '1000'), 10),
        responseTime: parseInt(configService.get('ALERT_RESPONSE_TIME_THRESHOLD', '3000'), 10),
        errorRate: parseFloat(configService.get('ALERT_ERROR_RATE_THRESHOLD', '0.05')),
        cpuUsage: parseFloat(configService.get('ALERT_CPU_THRESHOLD', '0.8')),
        memoryUsage: parseFloat(configService.get('ALERT_MEMORY_THRESHOLD', '0.8')),
      },
      alertChannels: {
        email: configService.get('ALERT_EMAIL_ENABLED', 'false') === 'true',
        webhook: configService.get('ALERT_WEBHOOK_ENABLED', 'false') === 'true',
      },
      webhookUrl: configService.get('ALERT_WEBHOOK_URL'),
    },
  };
}
