import express from 'express';
import instagramOAuthRouter from './oauth/instagram';
import youtubeOAuthRouter from './oauth/youtube';
import twitterOAuthRouter from './oauth/twitter';
import telegramOAuthRouter from './oauth/telegram';
import linkedinOAuthRouter from './oauth/linkedin';
import { pool } from '../lib/database';
import crypto from 'crypto';

const router = express.Router();

console.log('✅ OAuth router loaded');

// Debug middleware
router.use((req, res, next) => {
  console.log(`🔍 OAuth Router: ${req.method} ${req.path}`);
  next();
});

// Register individual OAuth routes
// Note: Facebook OAuth is handled through Instagram OAuth (same Graph API)
router.use('/facebook', instagramOAuthRouter); // Facebook uses same OAuth as Instagram
router.use('/instagram', instagramOAuthRouter);
router.use('/youtube', youtubeOAuthRouter);
router.use('/twitter', twitterOAuthRouter);
router.use('/telegram', telegramOAuthRouter);
router.use('/linkedin', linkedinOAuthRouter);

// OAuth status endpoint (public - no auth required)
router.get('/status', (req, res) => {
  res.json({
    facebook: !!process.env.FACEBOOK_APP_ID,
    instagram: !!process.env.INSTAGRAM_APP_ID || !!process.env.FACEBOOK_APP_ID,
    youtube: !!process.env.YOUTUBE_CLIENT_ID,
    twitter: !!process.env.TWITTER_CLIENT_ID,
    telegram: true, // Always available (bot token-based)
    linkedin: !!process.env.LINKEDIN_CLIENT_ID,
  });
});

export default router;
