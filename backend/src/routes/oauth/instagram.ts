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
 * GET /api/oauth/instagram
 * Redirect to Facebook OAuth (Instagram uses Facebook Graph API)
 */
router.get('/', (req: any, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const FACEBOOK_APP_ID = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
  const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.BASE_URL}/api/oauth/instagram/callback`;
  
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_insights',
    'pages_read_engagement',
    'pages_manage_posts',
  ].join(',');

  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${FACEBOOK_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}&` +
    `response_type=code`;

  res.redirect(authUrl);
});

/**
 * GET /api/oauth/instagram/callback
 * Handle Instagram OAuth callback
 */
router.get('/callback', async (req: any, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('Instagram OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=instagram_oauth_failed`);
  }

  if (!code || !state) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=missing_code_or_state`);
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));

    // Step 1: Exchange code for access token
    const FACEBOOK_APP_ID = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
    const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.BASE_URL}/api/oauth/instagram/callback`;

    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
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

    // Step 3: Get Facebook Pages
    const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token: longLivedToken,
      },
    });

    const pages = pagesResponse.data.data;

    if (!pages || pages.length === 0) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=no_facebook_pages`);
    }

    // Step 4: Get Instagram Business Account for each page
    let instagramAccountFound = false;

    for (const page of pages) {
      try {
        const igResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account`,
          {
            params: {
              access_token: page.access_token,
            },
          }
        );

        const igAccount = igResponse.data.instagram_business_account;

        if (igAccount) {
          // Get Instagram account details
          const igDetailsResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${igAccount.id}?fields=id,username,profile_picture_url`,
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
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?success=instagram_connected`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=no_instagram_business_account`);
    }

  } catch (error: any) {
    console.error('Instagram OAuth callback error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=instagram_auth_failed`);
  }
});

export default router;
