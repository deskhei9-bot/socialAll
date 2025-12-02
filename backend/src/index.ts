import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { pool } from './lib/database';
import { verifyToken } from './lib/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware
export const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    // Map userId from token to id for consistency
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check - aligned with nginx config
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Auth routes
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

// Protected routes
import postsRoutes from './routes/posts';
import channelsRoutes from './routes/channels';
import usersRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import oauthRoutes from './routes/oauth';
import aiRoutes from './routes/ai';

app.use('/api/posts', authenticate, postsRoutes);
app.use('/api/channels', authenticate, channelsRoutes);
app.use('/api/users', authenticate, usersRoutes);
app.use('/api/upload', authenticate, uploadRoutes);
app.use('/api/oauth', authenticate, oauthRoutes);
app.use('/api/ai', authenticate, aiRoutes);
import publishRoutes from './routes/publish';
app.use('/api/publish', authenticate, publishRoutes);

// Analytics and Scheduler routes
import metricsRoutes from './routes/metrics';
import analyticsRoutes from './routes/analytics';
import schedulerRoutes from './routes/scheduler';
app.use('/api/metrics', authenticate, metricsRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/scheduler', authenticate, schedulerRoutes);

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Import and start scheduler
import { SchedulerService } from './services/scheduler';
SchedulerService.start();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
