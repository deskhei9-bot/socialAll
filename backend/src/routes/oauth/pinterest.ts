import express from 'express';
import axios from 'axios';
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
 * GET /api/oauth/pinterest
 * Redirect to Pinterest OAuth
 * PUBLIC: Auth token passed via query parameter
 */
router.get('/', (req: any, res) => {
  console.log('📍 Pinterest OAuth GET / route hit');
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

  const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
  const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log('❌ Pinterest OAuth credentials not configured');
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=pinterest_not_configured&message=${encodeURIComponent('Pinterest OAuth is not configured. Please set PINTEREST_CLIENT_ID and PINTEREST_CLIENT_SECRET.')}`);
  }

  const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/pinterest/callback`;
  
  // Pinterest scopes
  const scopes = [
    'boards:read',
    'boards:write',
    'pins:read',
    'pins:write',
    'user_accounts:read',
  ].join(',');

  const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');

  const authUrl = `https://www.pinterest.com/oauth/?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}`;

  console.log(`🔐 Pinterest OAuth initiated for user ${userId}`);
  console.log(`📍 Redirect URI: ${REDIRECT_URI}`);
  
  res.redirect(authUrl);
});

/**
 * GET /api/oauth/pinterest/callback
 * Handle Pinterest OAuth callback
 * PUBLIC: No authentication required (user coming from Pinterest)
 */
router.get('/callback', async (req: any, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('❌ Pinterest OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=pinterest_oauth_failed&message=${encodeURIComponent(error as string)}`);
  }

  if (!code || !state) {
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=missing_code_or_state`);
  }

  try {
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const userId = stateData.userId;
    console.log(`📥 Pinterest OAuth callback received for user ${userId}`);

    const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
    const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
    const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/pinterest/callback`;

    // Step 1: Exchange code for access token
    const tokenResponse = await axios.post(
      'https://api.pinterest.com/v5/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: REDIRECT_URI,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    console.log(`✅ Pinterest access token obtained`);

    // Step 2: Get user info
    const userResponse = await axios.get('https://api.pinterest.com/v5/user_account', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = userResponse.data;
    const username = userData.username;
    const profileImage = userData.profile_image;

    console.log(`📱 Pinterest user: ${username}`);

    // Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    // Check if already connected
    const existingChannel = await pool.query(
      'SELECT id FROM connected_channels WHERE user_id = $1 AND platform = $2 AND channel_id = $3',
      [userId, 'pinterest', username]
    );

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
          encryptToken(access_token),
          username,
          JSON.stringify({
            refresh_token: refresh_token ? encryptToken(refresh_token) : null,
            profile_image: profileImage,
          }),
          tokenExpiresAt,
          existingChannel.rows[0].id,
        ]
      );
      console.log(`✅ Pinterest account updated: ${username}`);
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO connected_channels 
         (user_id, platform, channel_id, channel_name, access_token, metadata, token_expires_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          'pinterest',
          username,
          username,
          encryptToken(access_token),
          JSON.stringify({
            refresh_token: refresh_token ? encryptToken(refresh_token) : null,
            profile_image: profileImage,
          }),
          tokenExpiresAt,
        ]
      );
      console.log(`✅ Pinterest account connected: ${username}`);
    }

    res.redirect(`${process.env.FRONTEND_URL}/channels?success=pinterest_connected`);

  } catch (error: any) {
    console.error('❌ Pinterest OAuth callback error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
    res.redirect(`${process.env.FRONTEND_URL}/channels?error=pinterest_auth_failed&message=${encodeURIComponent(errorMsg)}`);
  }
});

/**
 * POST /api/oauth/pinterest/refresh
 * Refresh Pinterest access token
 */
router.post('/refresh', async (req: any, res) => {
  const { channelId, refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
    const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;

    const tokenResponse = await axios.post(
      'https://api.pinterest.com/v5/oauth/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    // Update in database if channelId provided
    if (channelId) {
      await pool.query(
        `UPDATE connected_channels 
         SET access_token = $1, 
             metadata = jsonb_set(metadata::jsonb, '{refresh_token}', $2::jsonb),
             token_expires_at = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [
          encryptToken(access_token),
          JSON.stringify(refresh_token ? encryptToken(refresh_token) : null),
          tokenExpiresAt,
          channelId,
        ]
      );
    }

    res.json({
      success: true,
      access_token,
      refresh_token,
      expires_in,
    });

  } catch (error: any) {
    console.error('❌ Pinterest token refresh error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
