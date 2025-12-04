import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { pool } from '../../lib/database';

const router = express.Router();

// Store temporary PKCE code verifiers (in production, use Redis)
const codeVerifiers = new Map<string, { codeVerifier: string; userId: string }>();

function encryptToken(token: string): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Generate PKCE code verifier and challenge
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return { codeVerifier, codeChallenge };
}

/**
 * GET /api/oauth/tiktok
 * Redirect to TikTok OAuth
 * PUBLIC: Auth token passed via query parameter
 */
router.get('/', (req: any, res) => {
  console.log('📍 TikTok OAuth GET / route hit');
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

  const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
  const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

  if (!CLIENT_KEY || !CLIENT_SECRET) {
    console.log('❌ TikTok OAuth credentials not configured');
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=tiktok_not_configured&message=${encodeURIComponent('TikTok OAuth is not configured. Please set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET.')}`);
  }

  const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/tiktok/callback`;
  
  // TikTok scopes for content posting
  const scopes = [
    'user.info.basic',
    'video.list',
    'video.upload',
    'video.publish',
  ].join(',');

  // Generate PKCE
  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString('hex');

  // Store code verifier temporarily (expires in 15 minutes)
  codeVerifiers.set(state, { codeVerifier, userId });
  setTimeout(() => {
    codeVerifiers.delete(state);
  }, 15 * 60 * 1000);

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?` +
    `client_key=${CLIENT_KEY}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `response_type=code&` +
    `state=${state}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256`;

  console.log(`🔐 TikTok OAuth initiated for user ${userId}`);
  console.log(`📍 Redirect URI: ${REDIRECT_URI}`);
  
  res.redirect(authUrl);
});

/**
 * GET /api/oauth/tiktok/callback
 * Handle TikTok OAuth callback
 * PUBLIC: No authentication required (user coming from TikTok)
 */
router.get('/callback', async (req: any, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('❌ TikTok OAuth error:', error, error_description);
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=tiktok_oauth_failed&message=${encodeURIComponent(error_description || error)}`);
  }

  if (!code || !state) {
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=missing_code_or_state`);
  }

  // Retrieve stored code verifier
  const storedData = codeVerifiers.get(state as string);
  if (!storedData) {
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=tiktok_state_expired`);
  }

  const { codeVerifier, userId } = storedData;
  console.log(`📥 TikTok OAuth callback received for user ${userId}`);

  try {
    const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
    const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
    const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/tiktok/callback`;

    // Step 1: Exchange code for access token
    const tokenResponse = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      new URLSearchParams({
        client_key: CLIENT_KEY!,
        client_secret: CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in, open_id } = tokenResponse.data;

    console.log(`✅ TikTok access token obtained for open_id: ${open_id}`);

    // Step 2: Get user info
    const userResponse = await axios.get(
      'https://open.tiktokapis.com/v2/user/info/',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          fields: 'open_id,union_id,avatar_url,display_name,username',
        },
      }
    );

    const userData = userResponse.data.data?.user;
    const displayName = userData?.display_name || userData?.username || 'TikTok User';
    const username = userData?.username;
    const avatarUrl = userData?.avatar_url;

    console.log(`📱 TikTok user: ${displayName} (@${username})`);

    // Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    // Check if already connected
    const existingChannel = await pool.query(
      'SELECT id FROM connected_channels WHERE user_id = $1 AND platform = $2 AND channel_id = $3',
      [userId, 'tiktok', open_id]
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
          displayName,
          JSON.stringify({
            refresh_token: refresh_token ? encryptToken(refresh_token) : null,
            username: username,
            avatar_url: avatarUrl,
            open_id: open_id,
          }),
          tokenExpiresAt,
          existingChannel.rows[0].id,
        ]
      );
      console.log(`✅ TikTok account updated: ${displayName}`);
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO connected_channels 
         (user_id, platform, channel_id, channel_name, access_token, metadata, token_expires_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          'tiktok',
          open_id,
          displayName,
          encryptToken(access_token),
          JSON.stringify({
            refresh_token: refresh_token ? encryptToken(refresh_token) : null,
            username: username,
            avatar_url: avatarUrl,
            open_id: open_id,
          }),
          tokenExpiresAt,
        ]
      );
      console.log(`✅ TikTok account connected: ${displayName}`);
    }

    // Clean up
    codeVerifiers.delete(state as string);

    res.redirect(`${process.env.FRONTEND_URL}/channels?success=tiktok_connected`);

  } catch (error: any) {
    console.error('❌ TikTok OAuth callback error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
    res.redirect(`${process.env.FRONTEND_URL}/channels?error=tiktok_auth_failed&message=${encodeURIComponent(errorMsg)}`);
  }
});

/**
 * POST /api/oauth/tiktok/refresh
 * Refresh TikTok access token
 */
router.post('/refresh', async (req: any, res) => {
  const { channelId, refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
    const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

    const tokenResponse = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      new URLSearchParams({
        client_key: CLIENT_KEY!,
        client_secret: CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
    console.error('❌ TikTok token refresh error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
