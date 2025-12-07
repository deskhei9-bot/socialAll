import { pool } from '../lib/database';
import axios from 'axios';
import { google } from 'googleapis';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

function encryptToken(token: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptToken(encryptedToken: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Refresh days before expiry
const REFRESH_DAYS_BEFORE = 3;

interface RefreshResult {
  success: boolean;
  error?: string;
  newExpiresAt?: Date;
}

async function refreshFacebookToken(channel: any): Promise<RefreshResult> {
  try {
    const accessToken = decryptToken(channel.access_token);
    
    // Facebook long-lived tokens last 60 days. Exchange for new one.
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        fb_exchange_token: accessToken,
      },
    });

    const { access_token, expires_in } = response.data;
    const tokenExpiresAt = new Date(Date.now() + (expires_in || 5184000) * 1000); // Default 60 days

    await pool.query(
      `UPDATE connected_channels 
       SET access_token = $1, token_expires_at = $2, updated_at = NOW()
       WHERE id = $3`,
      [encryptToken(access_token), tokenExpiresAt, channel.id]
    );

    return { success: true, newExpiresAt: tokenExpiresAt };
  } catch (error: any) {
    console.error(`[TokenRefresh] Facebook refresh failed for channel ${channel.id}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function refreshInstagramToken(channel: any): Promise<RefreshResult> {
  // Instagram uses the same token as Facebook (through Facebook Pages)
  return refreshFacebookToken(channel);
}

async function refreshYouTubeToken(channel: any): Promise<RefreshResult> {
  try {
    const refreshToken = channel.metadata?.refresh_token 
      ? decryptToken(channel.metadata.refresh_token) 
      : null;

    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    const tokenExpiresAt = credentials.expiry_date 
      ? new Date(credentials.expiry_date) 
      : new Date(Date.now() + 3600 * 1000);

    await pool.query(
      `UPDATE connected_channels 
       SET access_token = $1, token_expires_at = $2, updated_at = NOW()
       WHERE id = $3`,
      [encryptToken(credentials.access_token!), tokenExpiresAt, channel.id]
    );

    return { success: true, newExpiresAt: tokenExpiresAt };
  } catch (error: any) {
    console.error(`[TokenRefresh] YouTube refresh failed for channel ${channel.id}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function refreshTikTokToken(channel: any): Promise<RefreshResult> {
  try {
    const refreshToken = channel.refresh_token 
      ? decryptToken(channel.refresh_token) 
      : channel.metadata?.refresh_token 
        ? decryptToken(channel.metadata.refresh_token) 
        : null;

    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const response = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    await pool.query(
      `UPDATE connected_channels 
       SET access_token = $1, 
           refresh_token = $2, 
           token_expires_at = $3, 
           updated_at = NOW()
       WHERE id = $4`,
      [encryptToken(access_token), encryptToken(refresh_token), tokenExpiresAt, channel.id]
    );

    return { success: true, newExpiresAt: tokenExpiresAt };
  } catch (error: any) {
    console.error(`[TokenRefresh] TikTok refresh failed for channel ${channel.id}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function refreshLinkedInToken(channel: any): Promise<RefreshResult> {
  try {
    const refreshToken = channel.refresh_token 
      ? decryptToken(channel.refresh_token) 
      : channel.metadata?.refresh_token 
        ? decryptToken(channel.metadata.refresh_token) 
        : null;

    if (!refreshToken) {
      return { success: false, error: 'No refresh token available - LinkedIn requires re-authentication' };
    }

    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    await pool.query(
      `UPDATE connected_channels 
       SET access_token = $1, 
           refresh_token = $2, 
           token_expires_at = $3, 
           updated_at = NOW()
       WHERE id = $4`,
      [
        encryptToken(access_token), 
        refresh_token ? encryptToken(refresh_token) : channel.refresh_token, 
        tokenExpiresAt, 
        channel.id
      ]
    );

    return { success: true, newExpiresAt: tokenExpiresAt };
  } catch (error: any) {
    console.error(`[TokenRefresh] LinkedIn refresh failed for channel ${channel.id}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function refreshPinterestToken(channel: any): Promise<RefreshResult> {
  try {
    const refreshToken = channel.refresh_token 
      ? decryptToken(channel.refresh_token) 
      : channel.metadata?.refresh_token 
        ? decryptToken(channel.metadata.refresh_token) 
        : null;

    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const credentials = Buffer.from(
      `${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      'https://api.pinterest.com/v5/oauth/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    await pool.query(
      `UPDATE connected_channels 
       SET access_token = $1, 
           metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{refresh_token}', $2::jsonb),
           token_expires_at = $3, 
           updated_at = NOW()
       WHERE id = $4`,
      [
        encryptToken(access_token),
        JSON.stringify(refresh_token ? encryptToken(refresh_token) : null),
        tokenExpiresAt,
        channel.id
      ]
    );

    return { success: true, newExpiresAt: tokenExpiresAt };
  } catch (error: any) {
    console.error(`[TokenRefresh] Pinterest refresh failed for channel ${channel.id}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function refreshTwitterToken(channel: any): Promise<RefreshResult> {
  // Twitter OAuth 1.0a tokens don't expire, but OAuth 2.0 tokens do
  // Check if we have OAuth 2.0 refresh token
  const refreshToken = channel.refresh_token 
    ? decryptToken(channel.refresh_token) 
    : channel.metadata?.refresh_token 
      ? decryptToken(channel.metadata.refresh_token) 
      : null;

  if (!refreshToken) {
    // OAuth 1.0a - tokens don't expire
    return { success: true, newExpiresAt: undefined };
  }

  try {
    const credentials = Buffer.from(
      `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    await pool.query(
      `UPDATE connected_channels 
       SET access_token = $1, 
           refresh_token = $2, 
           token_expires_at = $3, 
           updated_at = NOW()
       WHERE id = $4`,
      [
        encryptToken(access_token), 
        refresh_token ? encryptToken(refresh_token) : channel.refresh_token, 
        tokenExpiresAt, 
        channel.id
      ]
    );

    return { success: true, newExpiresAt: tokenExpiresAt };
  } catch (error: any) {
    console.error(`[TokenRefresh] Twitter refresh failed for channel ${channel.id}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function refreshChannelToken(channel: any): Promise<RefreshResult> {
  const platform = channel.platform;

  switch (platform) {
    case 'facebook':
      return refreshFacebookToken(channel);
    case 'instagram':
      return refreshInstagramToken(channel);
    case 'youtube':
      return refreshYouTubeToken(channel);
    case 'tiktok':
      return refreshTikTokToken(channel);
    case 'linkedin':
      return refreshLinkedInToken(channel);
    case 'pinterest':
      return refreshPinterestToken(channel);
    case 'twitter':
      return refreshTwitterToken(channel);
    case 'telegram':
      // Telegram bot tokens don't expire
      return { success: true };
    default:
      return { success: false, error: `Unknown platform: ${platform}` };
  }
}

async function processExpiringTokens(): Promise<void> {
  let client;
  
  try {
    client = await pool.connect();
    
    // Find channels with tokens expiring within REFRESH_DAYS_BEFORE days
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + REFRESH_DAYS_BEFORE);
    
    const result = await client.query(
      `SELECT * FROM connected_channels 
       WHERE is_active = true 
       AND token_expires_at IS NOT NULL 
       AND token_expires_at <= $1 
       AND token_expires_at > NOW()
       ORDER BY token_expires_at ASC`,
      [expiryThreshold]
    );

    if (result.rows.length === 0) {
      return;
    }

    console.log(`[TokenRefresh] Found ${result.rows.length} tokens expiring soon`);

    for (const channel of result.rows) {
      console.log(`[TokenRefresh] Refreshing ${channel.platform} token for channel ${channel.id} (expires: ${channel.token_expires_at})`);
      
      const refreshResult = await refreshChannelToken(channel);
      
      if (refreshResult.success) {
        console.log(`[TokenRefresh] ✅ ${channel.platform} token refreshed successfully${refreshResult.newExpiresAt ? ` (new expiry: ${refreshResult.newExpiresAt})` : ''}`);
      } else {
        console.log(`[TokenRefresh] ❌ ${channel.platform} token refresh failed: ${refreshResult.error}`);
        
        // Log the failed refresh attempt
        await client.query(
          `INSERT INTO activity_logs (user_id, action, details, created_at)
           VALUES ($1, $2, $3, NOW())`,
          [
            channel.user_id,
            'token_refresh_failed',
            JSON.stringify({
              channel_id: channel.id,
              platform: channel.platform,
              account_name: channel.channel_name,
              error: refreshResult.error,
            })
          ]
        ).catch(() => {}); // Ignore if activity_logs table doesn't exist
      }

      // Small delay between refreshes to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error: any) {
    if (error.code !== 'ECONNREFUSED') {
      console.error('[TokenRefresh] Error:', error.message);
    }
  } finally {
    if (client) client.release();
  }
}

export const TokenRefreshService = {
  processExpiringTokens,
  refreshChannelToken,
  REFRESH_DAYS_BEFORE,
};
