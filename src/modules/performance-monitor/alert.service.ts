import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getPerformanceMonitorConfig, AlertConfig } from '@/config/performance-monitor';
import { PrometheusService } from './prometheus.service';
import { EmailService } from '@/modules/email/email.service';
import axios from 'axios';

export interface Alert {
  id: string;
  type: 'qps' | 'response_time' | 'error_rate' | 'cpu_usage' | 'memory_usage';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  resolved?: boolean;
}

export interface AlertRule {
  name: string;
  type: 'qps' | 'response_time' | 'error_rate' | 'cpu_usage' | 'memory_usage';
  threshold: number;
  comparison: 'greater_than' | 'less_than' | 'equals';
  severity: 'info' | 'warning' | 'critical';
  cooldown: number;
  lastTriggered?: number;
}

@Injectable()
export class AlertService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AlertService.name);
  private readonly config: AlertConfig;
  private readonly prometheusService: PrometheusService;
  private readonly emailService: EmailService;
  private readonly alerts: Alert[] = [];
  private readonly alertRules: AlertRule[] = [];
  private readonly alertHistory: Map<string, Alert[]> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(
    prometheusService: PrometheusService,
    emailService: EmailService
  ) {
    this.config = getPerformanceMonitorConfig(new (require('@nestjs/config').ConfigService)()).alert;
    this.prometheusService = prometheusService;
    this.emailService = emailService;
    this.initializeAlertRules();
  }

  onModuleInit() {
    if (this.config.enabled) {
      this.logger.log('Alert service initialized');
      this.startMonitoring();
    } else {
      this.logger.warn('Alert service is disabled');
    }
  }

  onModuleDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.logger.log('Alert service destroyed');
  }

  private initializeAlertRules(): void {
    this.alertRules.push({
      name: 'High QPS',
      type: 'qps',
      threshold: this.config.thresholds.qps,
      comparison: 'greater_than',
      severity: 'warning',
      cooldown: 60000,
    });

    this.alertRules.push({
      name: 'High Response Time',
      type: 'response_time',
      threshold: this.config.thresholds.responseTime,
      comparison: 'greater_than',
      severity: 'warning',
      cooldown: 30000,
    });

    this.alertRules.push({
      name: 'High Error Rate',
      type: 'error_rate',
      threshold: this.config.thresholds.errorRate,
      comparison: 'greater_than',
      severity: 'critical',
      cooldown: 15000,
    });

    this.alertRules.push({
      name: 'High CPU Usage',
      type: 'cpu_usage',
      threshold: this.config.thresholds.cpuUsage,
      comparison: 'greater_than',
      severity: 'warning',
      cooldown: 60000,
    });

    this.alertRules.push({
      name: 'High Memory Usage',
      type: 'memory_usage',
      threshold: this.config.thresholds.memoryUsage,
      comparison: 'greater_than',
      severity: 'warning',
      cooldown: 60000,
    });
  }

  private startMonitoring(): void {
    this.checkInterval = setInterval(() => {
      this.checkAlerts();
    }, 10000);

    this.logger.log('Alert monitoring started');
  }

  private async checkAlerts(): Promise<void> {
    try {
      for (const rule of this.alertRules) {
        await this.checkAlertRule(rule);
      }
    } catch (error) {
      this.logger.error(`Error checking alerts: ${error.message}`);
    }
  }

  private async checkAlertRule(rule: AlertRule): Promise<void> {
    const now = Date.now();

    if (rule.lastTriggered && now - rule.lastTriggered < rule.cooldown) {
      return;
    }

    let currentValue: number;

    switch (rule.type) {
      case 'qps':
        currentValue = await this.getCurrentQPS();
        break;
      case 'response_time':
        currentValue = await this.getAverageResponseTime();
        break;
      case 'error_rate':
        currentValue = await this.getErrorRate();
        break;
      case 'cpu_usage':
        currentValue = this.getCPUUsage();
        break;
      case 'memory_usage':
        currentValue = this.getMemoryUsage();
        break;
    }

    const shouldTrigger = this.shouldTriggerAlert(rule, currentValue);

    if (shouldTrigger) {
      await this.triggerAlert(rule, currentValue);
      rule.lastTriggered = now;
    }
  }

  private shouldTriggerAlert(rule: AlertRule, value: number): boolean {
    switch (rule.comparison) {
      case 'greater_than':
        return value > rule.threshold;
      case 'less_than':
        return value < rule.threshold;
      case 'equals':
        return value === rule.threshold;
      default:
        return false;
    }
  }

  private async triggerAlert(rule: AlertRule, value: number): Promise<void> {
    const alert: Alert = {
      id: this.generateAlertId(),
      type: rule.type,
      severity: rule.severity,
      message: `${rule.name}: Current value ${value} exceeds threshold ${rule.threshold}`,
      value,
      threshold: rule.threshold,
      timestamp: Date.now(),
    };

    this.alerts.push(alert);

    const history = this.alertHistory.get(rule.type) || [];
    history.push(alert);
    this.alertHistory.set(rule.type, history);

    this.logger.warn(`Alert triggered: ${alert.message}`);

    if (this.config.alertChannels.email) {
      await this.sendEmailAlert(alert);
    }

    if (this.config.alertChannels.webhook && this.config.webhookUrl) {
      await this.sendWebhookAlert(alert);
    }
  }

  private async sendEmailAlert(alert: Alert): Promise<void> {
    try {
      await this.emailService.sendEmail({
        email: 'admin@example.com',
        type: 'alert',
        code: '',
        codeKey: '',
      });
      this.logger.log(`Email alert sent for ${alert.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email alert: ${error.message}`);
    }
  }

  private async sendWebhookAlert(alert: Alert): Promise<void> {
    try {
      await axios.post(this.config.webhookUrl!, {
        alert_id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        value: alert.value,
        threshold: alert.threshold,
        timestamp: alert.timestamp,
      });
      this.logger.log(`Webhook alert sent for ${alert.id}`);
    } catch (error) {
      this.logger.error(`Failed to send webhook alert: ${error.message}`);
    }
  }

  private async getCurrentQPS(): Promise<number> {
    return 0;
  }

  private async getAverageResponseTime(): Promise<number> {
    return 0;
  }

  private async getErrorRate(): Promise<number> {
    return 0;
  }

  private getCPUUsage(): number {
    const cpus = require('os').cpus();
    const totalUsage = cpus.reduce((acc: number, cpu: any) => {
      const total = Object.values(cpu.times).reduce((a: number, b: number) => a + b, 0) as number;
      return acc + total;
    }, 0);
    return totalUsage / (cpus.length * 1000000);
  }

  private getMemoryUsage(): number {
    const totalMem = require('os').totalmem();
    const freeMem = require('os').freemem();
    return (totalMem - freeMem) / totalMem;
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter((alert) => !alert.resolved);
  }

  /**
   * 获取告警历史
   * @param {string} type 告警类型（可选）
   * @returns {Alert[]} 告警历史
   */
  getAlertHistory(type?: string): Alert[] {
    if (type) {
      return this.alertHistory.get(type) || [];
    }
    return Array.from(this.alertHistory.values()).flat();
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.logger.log(`Alert ${alertId} resolved`);
    }
  }

  /**
   * 清除已解决的告警
   */
  clearResolvedAlerts(): void {
    const unresolvedAlerts = this.alerts.filter((alert) => !alert.resolved);
    this.alerts.length = 0;
    this.alerts.push(...unresolvedAlerts);
    this.logger.log('Resolved alerts cleared');
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldAlerts(): Promise<void> {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    for (const [type, alerts] of this.alertHistory) {
      const filtered = alerts.filter((alert) => alert.timestamp > oneDayAgo);
      this.alertHistory.set(type, filtered);
    }

    this.logger.log('Old alerts cleaned up');
  }
}
