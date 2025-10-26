import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus metrics service
 */
@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  public readonly httpRequestDuration: Histogram;
  public readonly httpRequestTotal: Counter;
  public readonly activeConnections: Gauge;
  public readonly orderMatchingDuration: Histogram;

  constructor() {
    this.registry = new Registry();

    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register: this.registry });

    // Custom metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.activeConnections = new Gauge({
      name: 'websocket_connections_active',
      help: 'Number of active WebSocket connections',
      registers: [this.registry],
    });

    this.orderMatchingDuration = new Histogram({
      name: 'order_matching_duration_seconds',
      help: 'Duration of order matching operations',
      registers: [this.registry],
    });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
