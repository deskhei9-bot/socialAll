import express from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { pool } from '../../lib/database';
import { getUserIdFromRequest } from '../../lib/oauth-request';
import { encryptToken } from '../../lib/token-crypto';

const router = express.Router();

// Store temporary OAuth tokens (in production, use Redis)
const oauthTokens = new Map<string, { oauth_token_secret: string; userId: string }>();

/**
 * GET /api/oauth/twitter
 * Initiate Twitter OAuth 1.0a flow
 * PUBLIC: Auth token passed via query parameter
 */
router.get('/', async (req: any, res) => {
  console.log('📍 Twitter OAuth GET / route hit');
  console.log('Query params:', req.query);
  
  const userId = getUserIdFromRequest(req);
  
  if (!userId) {
    console.log('❌ No userId found - returning 401');
    return res.status(401).json({ error: 'Unauthorized: valid auth token required' });
  }

  const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
  const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;

  if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
    console.log('❌ Twitter OAuth credentials not configured');
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=twitter_not_configured&message=${encodeURIComponent('Twitter OAuth is not configured. Please set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET.')}`);
  }

  try {
    const client = new TwitterApi({
      appKey: TWITTER_CLIENT_ID,
      appSecret: TWITTER_CLIENT_SECRET,
    });

    const callbackUrl = process.env.TWITTER_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/twitter/callback`;

    // Step 1: Get request token with force_login for multiple accounts
    const authLink = await client.generateAuthLink(callbackUrl, { 
      linkMode: 'authorize',
      forceLogin: true, // Force account selection for connecting multiple accounts
    });

    // Store oauth_token_secret temporarily (expires in 15 minutes)
    oauthTokens.set(authLink.oauth_token, {
      oauth_token_secret: authLink.oauth_token_secret,
      userId,
    });

    // Clean up old tokens after 15 minutes
    setTimeout(() => {
      oauthTokens.delete(authLink.oauth_token);
    }, 15 * 60 * 1000);

    console.log(`🔐 Twitter OAuth initiated for user ${userId}`);
    if (req.query.response === 'json' || req.headers.accept?.includes('application/json')) {
      return res.json({ url: authLink.url });
    }

    res.redirect(authLink.url);

  } catch (error: any) {
    console.error('❌ Twitter OAuth initiation error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/channels?error=twitter_oauth_failed&message=${encodeURIComponent(error.message || 'Unknown error')}`);
  }
});

/**
 * GET /api/oauth/twitter/callback
 * Handle Twitter OAuth callback
 * PUBLIC: No authentication required (user coming from Twitter)
 */
router.get('/callback', async (req: any, res) => {
  const { oauth_token, oauth_verifier, denied } = req.query;

  if (denied) {
    console.error('❌ Twitter OAuth denied:', denied);
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=twitter_oauth_denied`);
  }

  if (!oauth_token || !oauth_verifier) {
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=missing_oauth_params`);
  }

  try {
    // Retrieve stored oauth_token_secret
    const tokenData = oauthTokens.get(oauth_token as string);

    if (!tokenData) {
      return res.redirect(`${process.env.FRONTEND_URL}/channels?error=twitter_token_expired`);
    }

    const { oauth_token_secret, userId } = tokenData;
    console.log(`📥 Twitter OAuth callback received for user ${userId}`);

    // Step 2: Exchange for access token
    const client = new TwitterApi({
      appKey: process.env.TWITTER_CLIENT_ID!,
      appSecret: process.env.TWITTER_CLIENT_SECRET!,
      accessToken: oauth_token as string,
      accessSecret: oauth_token_secret,
    });

    const { client: loggedClient, accessToken, accessSecret } = await client.login(oauth_verifier as string);

    // Step 3: Get user info
    const user = await loggedClient.v2.me({
      'user.fields': ['profile_image_url', 'public_metrics'],
    });

    const userData = user.data;
    console.log(`📱 Twitter user: @${userData.username}`);

    // Check if already connected
    const existingChannel = await pool.query(
      'SELECT id FROM connected_channels WHERE user_id = $1 AND platform = $2 AND channel_id = $3',
      [userId, 'twitter', userData.id]
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
          `@${userData.username}`,
          JSON.stringify({
            access_secret: encryptToken(accessSecret),
            profile_image_url: userData.profile_image_url,
            followers_count: userData.public_metrics?.followers_count,
          }),
          existingChannel.rows[0].id,
        ]
      );
      console.log(`✅ Twitter account updated: @${userData.username}`);
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO connected_channels 
         (user_id, platform, channel_id, channel_name, access_token, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          'twitter',
          userData.id,
          `@${userData.username}`,
          encryptToken(accessToken),
          JSON.stringify({
            access_secret: encryptToken(accessSecret),
            profile_image_url: userData.profile_image_url,
            followers_count: userData.public_metrics?.followers_count,
          }),
        ]
      );
      console.log(`✅ Twitter account connected: @${userData.username}`);
    }

    // Clean up temporary token
    oauthTokens.delete(oauth_token as string);

    res.redirect(`${process.env.FRONTEND_URL}/channels?success=twitter_connected`);

  } catch (error: any) {
    console.error('❌ Twitter OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/channels?error=twitter_auth_failed&message=${encodeURIComponent(error.message || 'Unknown error')}`);
  }
});

export default router;
