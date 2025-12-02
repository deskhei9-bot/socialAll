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
 */
router.get('/', (req: any, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.BASE_URL}/api/oauth/linkedin/callback`;
  
  const scopes = [
    'r_liteprofile',
    'r_emailaddress',
    'w_member_social',
    'r_organization_social',
    'w_organization_social',
  ].join(' ');

  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}`;

  res.redirect(authUrl);
});

/**
 * GET /api/oauth/linkedin/callback
 * Handle LinkedIn OAuth callback
 */
router.get('/callback', async (req: any, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('LinkedIn OAuth error:', error, error_description);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=linkedin_oauth_failed`);
  }

  if (!code || !state) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=missing_code_or_state`);
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));

    const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
    const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
    const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.BASE_URL}/api/oauth/linkedin/callback`;

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

    // Step 2: Get user profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': '202304',
      },
    });

    const profile = profileResponse.data;
    const personId = profile.id;
    const firstName = profile.localizedFirstName || profile.firstName?.localized?.en_US || 'LinkedIn';
    const lastName = profile.localizedLastName || profile.lastName?.localized?.en_US || 'User';
    const fullName = `${firstName} ${lastName}`;

    // Get profile picture
    let profilePicture = null;
    try {
      const pictureResponse = await axios.get(
        'https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'LinkedIn-Version': '202304',
          },
        }
      );
      
      const displayImage = pictureResponse.data.profilePicture?.['displayImage~']?.elements;
      if (displayImage && displayImage.length > 0) {
        profilePicture = displayImage[0].identifiers?.[0]?.identifier;
      }
    } catch (error) {
      console.log('Could not fetch profile picture');
    }

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
             updated_at = NOW()
         WHERE id = $4`,
        [
          encryptToken(accessToken),
          fullName,
          JSON.stringify({
            author_urn: `urn:li:person:${personId}`,
            profile_picture: profilePicture,
            expires_in: expiresIn,
            expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
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
          'linkedin',
          personId,
          fullName,
          encryptToken(accessToken),
          JSON.stringify({
            author_urn: `urn:li:person:${personId}`,
            profile_picture: profilePicture,
            expires_in: expiresIn,
            expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
          }),
        ]
      );
    }

    console.log(`✅ LinkedIn account connected: ${fullName}`);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?success=linkedin_connected`);

  } catch (error: any) {
    console.error('LinkedIn OAuth callback error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=linkedin_auth_failed`);
  }
});

export default router;
