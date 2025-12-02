import { Router, Request, Response } from 'express';

const router = Router();

// Simple metrics for Prometheus
let requestCount = 0;
let errorCount = 0;
let requestDuration: number[] = [];

// Middleware to track metrics (add to main app)
export function metricsMiddleware(req: Request, res: Response, next: Function) {
  const start = Date.now();
  requestCount++;

  res.on('finish', () => {
    const duration = Date.now() - start;
    requestDuration.push(duration);
    
    // Keep only last 1000 measurements
    if (requestDuration.length > 1000) {
      requestDuration = requestDuration.slice(-1000);
    }

    if (res.statusCode >= 400) {
      errorCount++;
    }
  });

  next();
}

// Prometheus metrics endpoint
router.get('/', (req: Request, res: Response) => {
  const avgDuration = requestDuration.length > 0
    ? requestDuration.reduce((a, b) => a + b, 0) / requestDuration.length
    : 0;

  const metrics = `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${requestCount}

# HELP http_request_errors_total Total number of HTTP request errors
# TYPE http_request_errors_total counter
http_request_errors_total ${errorCount}

# HELP http_request_duration_ms Average HTTP request duration in milliseconds
# TYPE http_request_duration_ms gauge
http_request_duration_ms ${avgDuration.toFixed(2)}

# HELP nodejs_heap_size_bytes Node.js heap size in bytes
# TYPE nodejs_heap_size_bytes gauge
nodejs_heap_size_bytes ${process.memoryUsage().heapUsed}

# HELP nodejs_heap_total_bytes Node.js total heap size in bytes
# TYPE nodejs_heap_total_bytes gauge
nodejs_heap_total_bytes ${process.memoryUsage().heapTotal}

# HELP nodejs_external_memory_bytes Node.js external memory in bytes
# TYPE nodejs_external_memory_bytes gauge
nodejs_external_memory_bytes ${process.memoryUsage().external}

# HELP nodejs_uptime_seconds Node.js process uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${process.uptime().toFixed(0)}

# HELP backend_up Backend service status
# TYPE backend_up gauge
backend_up 1
`.trim();

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

export default router;
