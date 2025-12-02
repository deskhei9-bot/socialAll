import { Router, Request, Response } from 'express';
import { pool } from '../lib/database';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded';
      latency?: number;
      message?: string;
    };
  };
}

// Simple health check for load balancers
router.get('/ping', (_req: Request, res: Response) => {
  res.status(200).send('pong');
});

// Liveness probe - is the service running?
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe - is the service ready to accept traffic?
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      reason: 'database_unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

// Comprehensive health check
router.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  const services: HealthStatus['services'] = {};

  // Check Database
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbLatency = Date.now() - dbStart;
    services.database = { status: 'up', latency: dbLatency };
  } catch (error) {
    services.database = { status: 'down', message: 'Connection failed' };
  }

  // Check Auth Service (checking users table)
  try {
    const authStart = Date.now();
    await pool.query('SELECT 1 FROM users LIMIT 1');
    const authLatency = Date.now() - authStart;
    services.auth = { status: 'up', latency: authLatency };
  } catch (error) {
    services.auth = { status: 'down', message: 'Auth service unavailable' };
  }

  // Check Storage (checking if uploads directory exists)
  try {
    const storageStart = Date.now();
    // Just a simple check - storage is file-based
    const fs = require('fs');
    const uploadDir = process.env.UPLOAD_DIR || '/opt/social-symphony/uploads';
    fs.accessSync(uploadDir, fs.constants.R_OK | fs.constants.W_OK);
    const storageLatency = Date.now() - storageStart;
    services.storage = { status: 'up', latency: storageLatency };
  } catch (error) {
    services.storage = { status: 'down', message: 'Storage unavailable' };
  }

  // Determine overall status
  const serviceStatuses = Object.values(services).map(s => s.status);
  let overallStatus: HealthStatus['status'] = 'healthy';

  if (serviceStatuses.some(s => s === 'down')) {
    overallStatus = serviceStatuses.every(s => s === 'down') ? 'unhealthy' : 'degraded';
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Detailed service status for status page
router.get('/status', async (_req: Request, res: Response) => {
  const checks = [];

  // API Server
  checks.push({
    name: 'API Server',
    description: 'Backend API service',
    status: 'operational',
    latency: 0,
  });

  // Database
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    const latency = Date.now() - start;
    checks.push({
      name: 'Database',
      description: 'PostgreSQL database',
      status: latency > 500 ? 'degraded' : 'operational',
      latency,
    });
  } catch {
    checks.push({
      name: 'Database',
      description: 'PostgreSQL database',
      status: 'outage',
      latency: null,
    });
  }

  // Auth Service
  try {
    const start = Date.now();
    await pool.query('SELECT 1 FROM users LIMIT 1');
    const latency = Date.now() - start;
    checks.push({
      name: 'Authentication',
      description: 'User authentication service',
      status: latency > 500 ? 'degraded' : 'operational',
      latency,
    });
  } catch {
    checks.push({
      name: 'Authentication',
      description: 'User authentication service',
      status: 'outage',
      latency: null,
    });
  }

  // Storage
  try {
    const start = Date.now();
    const fs = require('fs');
    const uploadDir = process.env.UPLOAD_DIR || '/opt/social-symphony/uploads';
    fs.accessSync(uploadDir, fs.constants.R_OK | fs.constants.W_OK);
    const latency = Date.now() - start;
    checks.push({
      name: 'File Storage',
      description: 'Media file storage',
      status: latency > 1000 ? 'degraded' : 'operational',
      latency,
    });
  } catch {
    checks.push({
      name: 'File Storage',
      description: 'Media file storage',
      status: 'outage',
      latency: null,
    });
  }

  // Overall status
  const statuses = checks.map(c => c.status);
  let overall = 'operational';
  if (statuses.some(s => s === 'outage')) {
    overall = statuses.every(s => s === 'outage') ? 'major_outage' : 'partial_outage';
  } else if (statuses.some(s => s === 'degraded')) {
    overall = 'degraded';
  }

  res.json({
    overall,
    timestamp: new Date().toISOString(),
    checks,
  });
});

export default router;
