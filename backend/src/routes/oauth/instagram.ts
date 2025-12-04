import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { pool } from '../../lib/database';
import { authenticate } from '../../index';

const router = express.Router();

function encryptToken(token: string): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * GET /api/oauth/instagram
 * Redirect to Facebook OAuth (Instagram uses Facebook Graph API)
 * PUBLIC: Auth token passed via query parameter
 */
router.get('/', (req: any, res) => {
  console.log('📍 Instagram OAuth GET / route hit');
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers);
  
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
        // Silent fail, will error below
      }
    }
  }
  
  if (!userId) {
    console.log('❌ No userId found - returning 401');
    return res.status(401).json({ error: 'Unauthorized: userId required in query or auth header' });
  }

  const FACEBOOK_APP_ID = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
  const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/instagram/callback`;
  
  // Use only public_profile permission (default for Facebook Login)
  // This works in Development Mode without App Review
  const scopes = ['public_profile'].join(',');

  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
    `client_id=${FACEBOOK_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}&` +
    `response_type=code&` +
    `auth_type=rerequest`; // Force account selection for multiple accounts

  console.log(`🔐 Instagram OAuth initiated for user ${userId}`);
  console.log(`📍 Redirect URI: ${REDIRECT_URI}`);
  console.log(`🔑 App ID: ${FACEBOOK_APP_ID}`);
  
  res.redirect(authUrl);
});

/**
 * GET /api/oauth/instagram/callback
 * Handle Instagram OAuth callback
 * PUBLIC: No authentication required (user coming from Facebook)
 */
router.get('/callback', async (req: any, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('❌ Instagram OAuth error from Facebook:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=instagram_oauth_failed&message=${encodeURIComponent(error as string)}`);
  }

  if (!code || !state) {
    console.error('❌ Instagram OAuth: missing code or state');
    return res.redirect(`${process.env.FRONTEND_URL}/channels?error=missing_code_or_state`);
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));

    // Step 1: Exchange code for access token
    const FACEBOOK_APP_ID = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
    const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.BASE_URL}/api/oauth/instagram/callback`;

    console.log(`📥 OAuth callback received`);
    console.log(`🔑 App ID: ${FACEBOOK_APP_ID}`);
    console.log(`📍 Redirect URI: ${REDIRECT_URI}`);

    const tokenResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Exchange for long-lived token
    const longLivedResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        fb_exchange_token: accessToken,
      },
    });

    const longLivedToken = longLivedResponse.data.access_token;

    console.log(`✅ Long-lived token obtained`);

    // Step 3: Get Facebook Pages
    const pagesResponse = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: {
        access_token: longLivedToken,
      },
    });

    const pages = pagesResponse.data.data;

    console.log(`📄 Found ${pages?.length || 0} Facebook Pages`);

    if (!pages || pages.length === 0) {
      console.log('❌ No Facebook Pages found. User needs to create a Facebook Page first.');
      return res.redirect(`${process.env.FRONTEND_URL}/channels?error=no_facebook_pages&message=${encodeURIComponent('You need to create a Facebook Page first. Go to facebook.com/pages/create')}`);
    }

    // Step 4: Get Instagram Business Account for each page
    let instagramAccountFound = false;

    for (const page of pages) {
      try {
        console.log(`🔍 Checking page: ${page.name} (${page.id})`);
        
        const igResponse = await axios.get(
          `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account`,
          {
            params: {
              access_token: page.access_token,
            },
          }
        );

        const igAccount = igResponse.data.instagram_business_account;

        if (igAccount) {
          console.log(`✅ Instagram Business Account found: ${igAccount.id}`);
          
          // Get Instagram account details
          const igDetailsResponse = await axios.get(
            `https://graph.facebook.com/v19.0/${igAccount.id}?fields=id,username,profile_picture_url`,
            {
              params: {
                access_token: page.access_token,
              },
            }
          );

          const igDetails = igDetailsResponse.data;

          // Check if already connected
          const existingChannel = await pool.query(
            'SELECT id FROM connected_channels WHERE user_id = $1 AND platform = $2 AND channel_id = $3',
            [userId, 'instagram', igDetails.id]
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
                encryptToken(page.access_token),
                `@${igDetails.username}`,
                JSON.stringify({
                  instagram_account_id: igDetails.id,
                  facebook_page_id: page.id,
                  facebook_page_name: page.name,
                  profile_picture: igDetails.profile_picture_url,
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
                'instagram',
                igDetails.id,
                `@${igDetails.username}`,
                encryptToken(page.access_token),
                JSON.stringify({
                  instagram_account_id: igDetails.id,
                  facebook_page_id: page.id,
                  facebook_page_name: page.name,
                  profile_picture: igDetails.profile_picture_url,
                }),
              ]
            );
          }

          instagramAccountFound = true;
          console.log(`✅ Instagram account connected: @${igDetails.username}`);
        }
      } catch (error: any) {
        console.error(`Error checking Instagram for page ${page.name}:`, error.message);
      }
    }

    if (instagramAccountFound) {
      console.log('✅ Instagram OAuth completed successfully');
      res.redirect(`${process.env.FRONTEND_URL}/channels?success=instagram_connected`);
    } else {
      console.log('⚠️ No Instagram Business Account found on any Facebook Page');
      res.redirect(`${process.env.FRONTEND_URL}/channels?error=no_instagram_business_account&message=${encodeURIComponent('Your Facebook Page needs an Instagram Business Account. Connect it in Page Settings → Instagram')}`);
    }

  } catch (error: any) {
    console.error('❌ Instagram OAuth callback error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
    res.redirect(`${process.env.FRONTEND_URL}/channels?error=instagram_auth_failed&message=${encodeURIComponent(errorMsg)}`);
  }
});

export default router;
