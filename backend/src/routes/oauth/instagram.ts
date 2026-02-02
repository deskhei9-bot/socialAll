import express from 'express';
import axios from 'axios';
import { pool } from '../../lib/database';
import { createOAuthState, verifyOAuthState } from '../../lib/oauth-state';
import { getUserIdFromRequest } from '../../lib/oauth-request';
import { encryptToken } from '../../lib/token-crypto';

const router = express.Router();

/**
 * GET /api/oauth/instagram
 * Redirect to Facebook OAuth (Instagram uses Facebook Graph API)
 * PUBLIC: Auth token passed via query parameter
 */
router.get('/', (req: any, res) => {
  console.log('📍 Instagram OAuth GET / route hit');
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers);
  
  const userId = getUserIdFromRequest(req);
  
  if (!userId) {
    console.log('❌ No userId found - returning 401');
    return res.status(401).json({ error: 'Unauthorized: valid auth token required' });
  }

  const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_APP_ID;
  const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || process.env.INSTAGRAM_REDIRECT_URI || `${process.env.BACKEND_URL}/api/oauth/instagram/callback`;
  
  // Required permissions for Facebook & Instagram posting
  // Note: pages_* permissions require App Review for Production
  // In Development Mode, only works with Test Users
  const scopes = [
    'public_profile',           // Basic profile access
    'pages_show_list',          // List user's Facebook Pages
    'pages_read_engagement',    // Read Page insights
    'pages_manage_posts',       // Create and manage posts
    'instagram_basic',          // Basic Instagram account info
    'instagram_content_publish' // Post to Instagram
  ].join(',');

  const state = createOAuthState({ userId, provider: 'instagram' });

  const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?` +
    `client_id=${FACEBOOK_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}&` +
    `response_type=code`;

  console.log(`🔐 Instagram OAuth initiated for user ${userId}`);
  console.log(`📍 Redirect URI: ${REDIRECT_URI}`);
  console.log(`🔑 App ID: ${FACEBOOK_APP_ID}`);
  
  if (req.query.response === 'json' || req.headers.accept?.includes('application/json')) {
    return res.json({ url: authUrl });
  }

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
    const { userId } = verifyOAuthState(state as string);

    // Step 1: Exchange code for access token
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || process.env.INSTAGRAM_APP_SECRET;
    const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || process.env.INSTAGRAM_REDIRECT_URI || `${process.env.BASE_URL}/api/oauth/instagram/callback`;

    console.log(`📥 OAuth callback received`);
    console.log(`🔑 App ID: ${FACEBOOK_APP_ID}`);
    console.log(`📍 Redirect URI: ${REDIRECT_URI}`);

    const tokenResponse = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
      params: {
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Exchange for long-lived token
    const longLivedResponse = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
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
    const pagesResponse = await axios.get('https://graph.facebook.com/v20.0/me/accounts', {
      params: {
        access_token: longLivedToken,
        fields: 'id,name,access_token,category,instagram_business_account',
      },
    });

    const pages = pagesResponse.data.data;

    console.log(`📄 Found ${pages?.length || 0} Facebook Pages`);

    if (!pages || pages.length === 0) {
      console.log('❌ No Facebook Pages found. User needs to create a Facebook Page first.');
      return res.redirect(`${process.env.FRONTEND_URL}/channels?error=no_facebook_pages&message=${encodeURIComponent('You need to create a Facebook Page first. Go to facebook.com/pages/create')}`);
    }

    // Step 4: Save Facebook Pages and Instagram Business Accounts
    let instagramAccountFound = false;
    let facebookPageSaved = false;

    for (const page of pages) {
      try {
        console.log(`🔍 Checking page: ${page.name} (${page.id})`);
        
        // First, save the Facebook Page itself
        const existingFbPage = await pool.query(
          'SELECT id FROM connected_channels WHERE user_id = $1 AND platform = $2 AND channel_id = $3',
          [userId, 'facebook', page.id]
        );

        if (existingFbPage.rows.length > 0) {
          // Update existing Facebook Page
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
              page.name,
              JSON.stringify({
                page_id: page.id,
                category: page.category,
              }),
              existingFbPage.rows[0].id,
            ]
          );
          console.log(`✅ Facebook Page updated: ${page.name}`);
        } else {
          // Insert new Facebook Page
          await pool.query(
            `INSERT INTO connected_channels 
             (user_id, platform, channel_id, channel_name, access_token, metadata) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              userId,
              'facebook',
              page.id,
              page.name,
              encryptToken(page.access_token),
              JSON.stringify({
                page_id: page.id,
                category: page.category,
              }),
            ]
          );
          console.log(`✅ Facebook Page connected: ${page.name}`);
        }
        facebookPageSaved = true;
        
        // Then check for Instagram Business Account
        const igResponse = await axios.get(
          `https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account`,
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
            `https://graph.facebook.com/v20.0/${igAccount.id}?fields=id,username,profile_picture_url`,
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

    // Return success based on what was connected
    if (facebookPageSaved || instagramAccountFound) {
      const platforms = [];
      if (facebookPageSaved) platforms.push('Facebook Page');
      if (instagramAccountFound) platforms.push('Instagram');
      
      console.log(`✅ OAuth completed successfully: ${platforms.join(' and ')}`);
      res.redirect(`${process.env.FRONTEND_URL}/channels?success=facebook_connected&message=${encodeURIComponent(platforms.join(' and ') + ' connected successfully')}`);
    } else if (facebookPageSaved && !instagramAccountFound) {
      console.log('⚠️ Facebook Page saved but no Instagram Business Account found');
      res.redirect(`${process.env.FRONTEND_URL}/channels?success=facebook_connected&message=${encodeURIComponent('Facebook Page connected. To add Instagram, connect it in your Page Settings')}`);
    } else {
      console.log('⚠️ No accounts could be connected');
      res.redirect(`${process.env.FRONTEND_URL}/channels?error=no_accounts&message=${encodeURIComponent('Could not connect any accounts. Please try again')}`);
    }

  } catch (error: any) {
    console.error('❌ Instagram OAuth callback error:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
    res.redirect(`${process.env.FRONTEND_URL}/channels?error=instagram_auth_failed&message=${encodeURIComponent(errorMsg)}`);
  }
});

export default router;
