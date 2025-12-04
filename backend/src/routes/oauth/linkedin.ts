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
 * GET /api/oauth/linkedin
 * Redirect to LinkedIn OAuth
 * PUBLIC: Auth token passed via query parameter
 */
router.get('/', (req: any, res) => {
  console.log('📍 LinkedIn OAuth GET / route hit');
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

  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log('❌ LinkedIn OAuth credentials not configured');
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=linkedin_not_configured&message=${encodeURIComponent('LinkedIn OAuth is not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.')}`);
  }

  const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/linkedin/callback`;
  
  // Updated scopes for LinkedIn API v2 (OpenID Connect)
  const scopes = [
    'openid',
    'profile',
    'email',
    'w_member_social',
  ].join(' ');

  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}`;

  console.log(`🔐 LinkedIn OAuth initiated for user ${userId}`);
  console.log(`📍 Redirect URI: ${REDIRECT_URI}`);
  
  res.redirect(authUrl);
});

/**
 * GET /api/oauth/linkedin/callback
 * Handle LinkedIn OAuth callback
 * PUBLIC: No authentication required (user coming from LinkedIn)
 */
router.get('/callback', async (req: any, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('❌ LinkedIn OAuth error:', error, error_description);
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=linkedin_oauth_failed&message=${encodeURIComponent(error_description || error)}`);
  }

  if (!code || !state) {
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=missing_code_or_state`);
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    console.log(`📥 LinkedIn OAuth callback received for user ${userId}`);

    const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
    const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
    const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/linkedin/callback`;

    // Step 1: Exchange code for access token
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const expiresIn = tokenResponse.data.expires_in;

    console.log(`✅ LinkedIn access token obtained`);

    // Step 2: Get user profile using userinfo endpoint (OpenID Connect)
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = profileResponse.data;
    const personId = profile.sub;
    const fullName = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'LinkedIn User';
    const profilePicture = profile.picture;
    const email = profile.email;

    console.log(`📱 LinkedIn user: ${fullName}`);

    // Calculate token expiry
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Check if already connected
    const existingChannel = await pool.query(
      'SELECT id FROM connected_channels WHERE user_id = $1 AND platform = $2 AND channel_id = $3',
      [userId, 'linkedin', personId]
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
          encryptToken(accessToken),
          fullName,
          JSON.stringify({
            author_urn: `urn:li:person:${personId}`,
            profile_picture: profilePicture,
            email: email,
          }),
          tokenExpiresAt,
          existingChannel.rows[0].id,
        ]
      );
      console.log(`✅ LinkedIn account updated: ${fullName}`);
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO connected_channels 
         (user_id, platform, channel_id, channel_name, access_token, metadata, token_expires_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          'linkedin',
          personId,
          fullName,
          encryptToken(accessToken),
          JSON.stringify({
            author_urn: `urn:li:person:${personId}`,
            profile_picture: profilePicture,
            email: email,
          }),
          tokenExpiresAt,
        ]
      );
      console.log(`✅ LinkedIn account connected: ${fullName}`);
    }

    res.redirect(`${process.env.FRONTEND_URL}/channels?success=linkedin_connected`);

  } catch (error: any) {
    console.error('❌ LinkedIn OAuth callback error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.error_description || error.message || 'Unknown error';
    res.redirect(`${process.env.FRONTEND_URL}/channels?error=linkedin_auth_failed&message=${encodeURIComponent(errorMsg)}`);
  }
});

export default router;
