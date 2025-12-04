import express from 'express';
import { google } from 'googleapis';
import crypto from 'crypto';
import { pool } from '../../lib/database';

const router = express.Router();

function encryptToken(token: string): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * GET /api/oauth/youtube
 * Redirect to Google OAuth
 * PUBLIC: Auth token passed via query parameter
 */
router.get('/', (req: any, res) => {
  console.log('📍 YouTube OAuth GET / route hit');
  console.log('Query params:', req.query);
  
  // Get user ID from query parameter (passed from frontend)
  const userIdFromQuery = req.query.userId;
  
  // Or try to get from auth header if available
  let userId = userIdFromQuery;
  
  if (!userId) {
    // Try to authenticate from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const { verifyToken } = require('../../lib/auth');
        const payload = verifyToken(token);
        userId = payload.userId;
        console.log('✅ User ID from auth header:', userId);
      } catch (error) {
        console.log('⚠️ Auth header verification failed:', error);
      }
    }
  }
  
  if (!userId) {
    console.log('❌ No userId found - returning 401');
    return res.status(401).json({ error: 'Unauthorized: userId required in query or auth header' });
  }

  const YOUTUBE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID;
  const YOUTUBE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/youtube/callback`;

  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
    console.log('❌ YouTube OAuth credentials not configured');
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=youtube_not_configured&message=${encodeURIComponent('YouTube OAuth is not configured. Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET.')}`);
  }

  const oauth2Client = new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET,
    REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ];

  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state,
    prompt: 'consent select_account', // Force account selection + consent for refresh token
  });

  console.log(`🔐 YouTube OAuth initiated for user ${userId}`);
  console.log(`📍 Redirect URI: ${REDIRECT_URI}`);
  
  res.redirect(authUrl);
});

/**
 * GET /api/oauth/youtube/callback
 * Handle YouTube OAuth callback
 * PUBLIC: No authentication required (user coming from Google)
 */
router.get('/callback', async (req: any, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('❌ YouTube OAuth error from Google:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=youtube_oauth_failed&message=${encodeURIComponent(error as string)}`);
  }

  if (!code || !state) {
    console.error('❌ YouTube OAuth: missing code or state');
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=missing_code_or_state`);
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    console.log(`📥 YouTube OAuth callback received for user ${userId}`);

    const YOUTUBE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID;
    const YOUTUBE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/youtube/callback`;

    const oauth2Client = new google.auth.OAuth2(
      YOUTUBE_CLIENT_ID,
      YOUTUBE_CLIENT_SECRET,
      REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const accessToken = tokens.access_token!;
    const refreshToken = tokens.refresh_token;

    console.log(`✅ Tokens obtained - Access: ${accessToken ? 'Yes' : 'No'}, Refresh: ${refreshToken ? 'Yes' : 'No'}`);

    // Get YouTube channel info
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelsResponse = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      mine: true,
    });

    const channels = channelsResponse.data.items;

    if (!channels || channels.length === 0) {
      console.log('❌ No YouTube channel found for this Google account');
      return res.redirect(`${process.env.FRONTEND_URL}/channels?error=no_youtube_channel&message=${encodeURIComponent('No YouTube channel found. Please create a YouTube channel first.')}`);
    }

    const channel = channels[0];
    const channelId = channel.id!;
    const channelTitle = channel.snippet?.title || 'YouTube Channel';
    const thumbnail = channel.snippet?.thumbnails?.default?.url;
    const subscriberCount = channel.statistics?.subscriberCount;

    console.log(`📺 YouTube channel found: ${channelTitle} (${channelId})`);

    // Check if already connected
    const existingChannel = await pool.query(
      'SELECT id FROM connected_channels WHERE user_id = $1 AND platform = $2 AND channel_id = $3',
      [userId, 'youtube', channelId]
    );

    // Calculate token expiry (Google tokens typically expire in 1 hour, but we use refresh token)
    const tokenExpiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    if (existingChannel.rows.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE connected_channels 
         SET access_token = $1, 
             channel_name = $2, 
             is_active = true,
             metadata = $3,
             token_expires_at = $4,
             updated_at = NOW()
         WHERE id = $5`,
        [
          encryptToken(accessToken),
          channelTitle,
          JSON.stringify({
            refresh_token: refreshToken ? encryptToken(refreshToken) : null,
            thumbnail,
            subscriber_count: subscriberCount,
            youtube_channel_id: channelId,
          }),
          tokenExpiresAt,
          existingChannel.rows[0].id,
        ]
      );
      console.log(`✅ YouTube channel updated: ${channelTitle}`);
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO connected_channels 
         (user_id, platform, channel_id, channel_name, access_token, metadata, token_expires_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          'youtube',
          channelId,
          channelTitle,
          encryptToken(accessToken),
          JSON.stringify({
            refresh_token: refreshToken ? encryptToken(refreshToken) : null,
            thumbnail,
            subscriber_count: subscriberCount,
            youtube_channel_id: channelId,
          }),
          tokenExpiresAt,
        ]
      );
      console.log(`✅ YouTube channel connected: ${channelTitle}`);
    }

    res.redirect(`${process.env.FRONTEND_URL}/channels?success=youtube_connected`);

  } catch (error: any) {
    console.error('❌ YouTube OAuth callback error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
    res.redirect(`${process.env.FRONTEND_URL}/channels?error=youtube_auth_failed&message=${encodeURIComponent(errorMsg)}`);
  }
});

export default router;
