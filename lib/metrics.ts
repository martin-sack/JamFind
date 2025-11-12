import { prisma } from '@/lib/db';

export interface MetricsData {
  timestamp: Date;
  successRate: number;
  errorRate: number;
  parseFailureRate: number;
  p95Latency: number;
  p99Latency: number;
  totalRequests: number;
  platformBreakdown: {
    spotify: PlatformMetrics;
    apple: PlatformMetrics;
    youtube: PlatformMetrics;
    other: PlatformMetrics;
  };
  topErrorTypes: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
  privateLinkRate: number;
  averageTrackCount: number;
}

export interface PlatformMetrics {
  successRate: number;
  totalRequests: number;
  errorCount: number;
  averageLatency: number;
}

export interface AlertThresholds {
  parseFailureRate: number; // 3% over 10 min
  p95Latency: number; // 1.5s
  errorRate: number; // 5% over 10 min
}

export const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  parseFailureRate: 0.03, // 3%
  p95Latency: 1500, // 1.5s in ms
  errorRate: 0.05, // 5%
};

// Mock data for now - in production this would query actual logs/metrics
export async function collectMetrics(timeWindowMinutes: number = 10): Promise<MetricsData> {
  const now = new Date();
  const startTime = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);

  // Mock metrics data - in production, this would query your monitoring system
  const mockMetrics: MetricsData = {
    timestamp: now,
    successRate: 0.95,
    errorRate: 0.05,
    parseFailureRate: 0.02,
    p95Latency: 1200,
    p99Latency: 1800,
    totalRequests: 1000,
    platformBreakdown: {
      spotify: {
        successRate: 0.96,
        totalRequests: 600,
        errorCount: 24,
        averageLatency: 800,
      },
      apple: {
        successRate: 0.94,
        totalRequests: 300,
        errorCount: 18,
        averageLatency: 1100,
      },
      youtube: {
        successRate: 0.92,
        totalRequests: 80,
        errorCount: 6,
        averageLatency: 1400,
      },
      other: {
        successRate: 0.90,
        totalRequests: 20,
        errorCount: 2,
        averageLatency: 1000,
      },
    },
    topErrorTypes: [
      { errorType: 'not_found', count: 15, percentage: 0.3 },
      { errorType: 'rate_limit', count: 10, percentage: 0.2 },
      { errorType: 'network_error', count: 8, percentage: 0.16 },
      { errorType: 'parse_error', count: 5, percentage: 0.1 },
    ],
    privateLinkRate: 0.08, // 8% of links are private
    averageTrackCount: 7.5,
  };

  return mockMetrics;
}

export async function checkAlerts(metrics: MetricsData, thresholds: AlertThresholds = DEFAULT_ALERT_THRESHOLDS) {
  const alerts: Array<{
    type: string;
    severity: 'warning' | 'critical';
    message: string;
    currentValue: number;
    threshold: number;
  }> = [];

  // Check parse failure rate
  if (metrics.parseFailureRate > thresholds.parseFailureRate) {
    alerts.push({
      type: 'PARSE_FAILURE_RATE_HIGH',
      severity: 'critical',
      message: `Parse failure rate is ${(metrics.parseFailureRate * 100).toFixed(1)}%, exceeding threshold of ${(thresholds.parseFailureRate * 100).toFixed(1)}%`,
      currentValue: metrics.parseFailureRate,
      threshold: thresholds.parseFailureRate,
    });
  }

  // Check P95 latency
  if (metrics.p95Latency > thresholds.p95Latency) {
    alerts.push({
      type: 'P95_LATENCY_HIGH',
      severity: 'warning',
      message: `P95 latency is ${metrics.p95Latency}ms, exceeding threshold of ${thresholds.p95Latency}ms`,
      currentValue: metrics.p95Latency,
      threshold: thresholds.p95Latency,
    });
  }

  // Check overall error rate
  if (metrics.errorRate > thresholds.errorRate) {
    alerts.push({
      type: 'ERROR_RATE_HIGH',
      severity: 'critical',
      message: `Error rate is ${(metrics.errorRate * 100).toFixed(1)}%, exceeding threshold of ${(thresholds.errorRate * 100).toFixed(1)}%`,
      currentValue: metrics.errorRate,
      threshold: thresholds.errorRate,
    });
  }

  return alerts;
}

export async function logMetricsSnapshot(metrics: MetricsData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: 'system', // System user for automated metrics
        action: 'METRICS_SNAPSHOT',
        entity: 'SYSTEM',
        metadataJSON: JSON.stringify({
          timestamp: metrics.timestamp.toISOString(),
          successRate: metrics.successRate,
          errorRate: metrics.errorRate,
          parseFailureRate: metrics.parseFailureRate,
          p95Latency: metrics.p95Latency,
          p99Latency: metrics.p99Latency,
          totalRequests: metrics.totalRequests,
          platformBreakdown: metrics.platformBreakdown,
          topErrorTypes: metrics.topErrorTypes,
          privateLinkRate: metrics.privateLinkRate,
          averageTrackCount: metrics.averageTrackCount,
        }),
      },
    });
  } catch (error) {
    console.error('Failed to log metrics snapshot:', error);
  }
}

// Function to get dashboard data for admin UI
export async function getDashboardData(timeWindowMinutes: number = 60) {
  const metrics = await collectMetrics(timeWindowMinutes);
  const alerts = await checkAlerts(metrics);

  return {
    metrics,
    alerts,
    thresholds: DEFAULT_ALERT_THRESHOLDS,
    timeWindow: timeWindowMinutes,
  };
}
