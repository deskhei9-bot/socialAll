import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './lib/database';
import { verifyToken } from './lib/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://socialautoupload.com',
  'http://localhost',
  'http://localhost:5173',
  'http://localhost:3000',
  /^https:\/\/.*\.lovable\.app$/, // Allow all Lovable preview domains
  /^https:\/\/.*\.lovableproject\.com$/, // Allow Lovable project domains
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS blocked: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests to /api/oauth
app.use('/api/oauth', (req, res, next) => {
  console.log(`🔍 OAuth Request: ${req.method} ${req.path}`);
  console.log(`🔍 Query:`, req.query);
  console.log(`🔍 Headers:`, req.headers.authorization ? 'Has Auth Header' : 'No Auth Header');
  next();
});

// Serve uploaded media files
app.use('/uploads', express.static('/opt/social-symphony/uploads'));

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

// OAuth routes (MUST be before Pinterest routes to avoid middleware conflicts)
import oauthRoutes from './routes/oauth';
app.use('/api/oauth', oauthRoutes); // OAuth routes handle auth internally

// Pinterest OAuth routes (has its own auth handling)
import pinterestOAuthRoutes from './routes/pinterest-oauth';
app.use('/api', pinterestOAuthRoutes); // Pinterest OAuth routes (includes auth middleware internally)

// Protected routes
import postsRoutes from './routes/posts';
import channelsRoutes from './routes/channels';
import usersRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import uploadUrlRoutes from './routes/upload-url';
import aiRoutes from './routes/ai';
import publishingProfilesRoutes from './routes/publishing-profiles';

app.use('/api/posts', authenticate, postsRoutes);
app.use('/api/channels', authenticate, channelsRoutes);
app.use('/api/users', authenticate, usersRoutes);
app.use('/api/upload', authenticate, uploadRoutes);
app.use('/api/upload', authenticate, uploadUrlRoutes);
app.use('/api/ai', authenticate, aiRoutes);
app.use('/api/publishing-profiles', authenticate, publishingProfilesRoutes);
import publishRoutes from './routes/publish';
app.use('/api/publish', authenticate, publishRoutes);

// Analytics and Scheduler routes
import metricsRoutes from './routes/metrics';
import analyticsRoutes from './routes/analytics';
import schedulerRoutes from './routes/scheduler';
import mediaCleanupRoutes from './routes/media-cleanup';
app.use('/api/metrics', authenticate, metricsRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/scheduler', authenticate, schedulerRoutes);
app.use('/api/media-cleanup', authenticate, mediaCleanupRoutes);

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
