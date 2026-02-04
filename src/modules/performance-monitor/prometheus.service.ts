import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { getPerformanceMonitorConfig, PrometheusConfig } from '@/config/performance-monitor';

export interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  help: string;
  labels?: string[];
}

export interface MetricValue {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

@Injectable()
export class PrometheusService implements OnModuleDestroy {
  private readonly logger = new Logger(PrometheusService.name);
  private readonly config: PrometheusConfig;
  private readonly metrics: Map<string, Metric> = new Map();
  private readonly metricValues: Map<string, number[]> = new Map();
  private readonly histogramBuckets: Map<string, number[]> = new Map();

  constructor() {
    this.config = getPerformanceMonitorConfig(new (require('@nestjs/config').ConfigService)()).prometheus;
    this.initializeDefaultMetrics();
  }

  private initializeDefaultMetrics(): void {
    this.registerMetric({
      name: 'http_requests_total',
      type: 'counter',
      help: 'Total number of HTTP requests',
      labels: ['method', 'path', 'status_code'],
    });

    this.registerMetric({
      name: 'http_request_duration_seconds',
      type: 'histogram',
      help: 'HTTP request duration in seconds',
      labels: ['method', 'path'],
    });

    this.registerMetric({
      name: 'http_requests_in_progress',
      type: 'gauge',
      help: 'Number of HTTP requests currently in progress',
      labels: ['method', 'path'],
    });

    this.registerMetric({
      name: 'http_errors_total',
      type: 'counter',
      help: 'Total number of HTTP errors',
      labels: ['method', 'path', 'error_type'],
    });

    this.registerMetric({
      name: 'db_connections_active',
      type: 'gauge',
      help: 'Number of active database connections',
    });

    this.registerMetric({
      name: 'db_query_duration_seconds',
      type: 'histogram',
      help: 'Database query duration in seconds',
      labels: ['query_type'],
    });

    this.registerMetric({
      name: 'cache_hits_total',
      type: 'counter',
      help: 'Total number of cache hits',
      labels: ['cache_type'],
    });

    this.registerMetric({
      name: 'cache_misses_total',
      type: 'counter',
      help: 'Total number of cache misses',
      labels: ['cache_type'],
    });

    this.registerMetric({
      name: 'circuit_breaker_state',
      type: 'gauge',
      help: 'Circuit breaker state (0=CLOSED, 1=OPEN, 2=HALF_OPEN)',
      labels: ['service', 'key'],
    });

    this.registerMetric({
      name: 'service_degradation_level',
      type: 'gauge',
      help: 'Service degradation level (0=NORMAL, 1=MINIMAL, 2=EMERGENCY)',
      labels: ['service'],
    });

    this.registerMetric({
      name: 'distributed_locks_active',
      type: 'gauge',
      help: 'Number of active distributed locks',
    });

    this.registerMetric({
      name: 'system_cpu_usage',
      type: 'gauge',
      help: 'System CPU usage percentage',
    });

    this.registerMetric({
      name: 'system_memory_usage',
      type: 'gauge',
      help: 'System memory usage percentage',
    });

    this.histogramBuckets.set('http_request_duration_seconds', [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]);
    this.histogramBuckets.set('db_query_duration_seconds', [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]);
  }

  registerMetric(metric: Metric): void {
    if (this.metrics.has(metric.name)) {
      this.logger.warn(`Metric ${metric.name} already registered`);
      return;
    }
    this.metrics.set(metric.name, metric);
    this.metricValues.set(metric.name, []);
  }

  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'counter') {
      this.logger.warn(`Metric ${name} is not a counter`);
      return;
    }

    const values = this.metricValues.get(name) || [];
    values.push(value);
    this.metricValues.set(name, values);
  }

  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'gauge') {
      this.logger.warn(`Metric ${name} is not a gauge`);
      return;
    }

    const values = this.metricValues.get(name) || [];
    values.push(value);
    this.metricValues.set(name, values);
  }

  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'histogram') {
      this.logger.warn(`Metric ${name} is not a histogram`);
      return;
    }

    const values = this.metricValues.get(name) || [];
    values.push(value);
    this.metricValues.set(name, values);
  }

  getMetrics(): string {
    let output = '';

    for (const [name, metric] of this.metrics) {
      const values = this.metricValues.get(name) || [];

      if (metric.type === 'counter') {
        output += this.formatCounter(name, metric, values);
      } else if (metric.type === 'gauge') {
        output += this.formatGauge(name, metric, values);
      } else if (metric.type === 'histogram') {
        output += this.formatHistogram(name, metric, values);
      }
    }

    return output;
  }

  private formatCounter(name: string, metric: Metric, values: number[]): string {
    const sum = values.reduce((a, b) => a + b, 0);
    return `# HELP ${name} ${metric.help}\n# TYPE ${name} counter\n${name}_total ${sum}\n\n`;
  }

  private formatGauge(name: string, metric: Metric, values: number[]): string {
    const value = values.length > 0 ? values[values.length - 1] : 0;
    return `# HELP ${name} ${metric.help}\n# TYPE ${name} gauge\n${name} ${value}\n\n`;
  }

  private formatHistogram(name: string, metric: Metric, values: number[]): string {
    if (values.length === 0) {
      return `# HELP ${name} ${metric.help}\n# TYPE ${name} histogram\n\n`;
    }

    const sortedValues = [...values].sort((a, b) => a - b);
    const buckets = this.histogramBuckets.get(name) || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    const sum = sortedValues.reduce((a, b) => a + b, 0);
    const count = sortedValues.length;
    const avg = sum / count;

    let output = `# HELP ${name} ${metric.help}\n# TYPE ${name} histogram\n`;
    output += `${name}_sum ${sum}\n`;
    output += `${name}_count ${count}\n`;

    let cumulativeCount = 0;
    for (const bucket of buckets) {
      const bucketCount = sortedValues.filter((v) => v <= bucket).length;
      output += `${name}_bucket{le="${bucket}"} ${bucketCount}\n`;
      cumulativeCount = bucketCount;
    }

    output += `${name}_bucket{le="+Inf"} ${count}\n`;
    output += `\n`;

    return output;
  }

  resetMetrics(): void {
    this.metricValues.clear();
    this.logger.log('All metrics have been reset');
  }

  onModuleDestroy() {
    this.logger.log('Prometheus service destroyed');
  }
}
