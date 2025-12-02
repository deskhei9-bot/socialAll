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
 */
router.get('/', (req: any, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI || `${process.env.BASE_URL}/api/oauth/youtube/callback`
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
    prompt: 'consent', // Force to get refresh token
  });

  res.redirect(authUrl);
});

/**
 * GET /api/oauth/youtube/callback
 * Handle YouTube OAuth callback
 */
router.get('/callback', async (req: any, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('YouTube OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=youtube_oauth_failed`);
  }

  if (!code || !state) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=missing_code_or_state`);
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI || `${process.env.BASE_URL}/api/oauth/youtube/callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const accessToken = tokens.access_token!;
    const refreshToken = tokens.refresh_token!;

    // Get YouTube channel info
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelsResponse = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      mine: true,
    });

    const channels = channelsResponse.data.items;

    if (!channels || channels.length === 0) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=no_youtube_channel`);
    }

    const channel = channels[0];
    const channelId = channel.id!;
    const channelTitle = channel.snippet?.title || 'YouTube Channel';
    const thumbnail = channel.snippet?.thumbnails?.default?.url;
    const subscriberCount = channel.statistics?.subscriberCount;

    // Check if already connected
    const existingChannel = await pool.query(
      'SELECT id FROM connected_channels WHERE user_id = $1 AND platform = $2 AND channel_id = $3',
      [userId, 'youtube', channelId]
    );

    if (existingChannel.rows.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE connected_channels 
         SET access_token = $1, 
             channel_name = $2, 
             is_active = true,
             metadata = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [
          encryptToken(accessToken),
          channelTitle,
          JSON.stringify({
            refresh_token: refreshToken,
            thumbnail,
            subscriber_count: subscriberCount,
          }),
          existingChannel.rows[0].id,
        ]
      );
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO connected_channels 
         (user_id, platform, channel_id, channel_name, access_token, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          'youtube',
          channelId,
          channelTitle,
          encryptToken(accessToken),
          JSON.stringify({
            refresh_token: refreshToken,
            thumbnail,
            subscriber_count: subscriberCount,
          }),
        ]
      );
    }

    console.log(`✅ YouTube channel connected: ${channelTitle}`);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?success=youtube_connected`);

  } catch (error: any) {
    console.error('YouTube OAuth callback error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=youtube_auth_failed`);
  }
});

export default router;
