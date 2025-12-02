/**
 * Pinterest OAuth Routes
 * Documentation: https://developers.pinterest.com/docs/getting-started/authentication/
 */

import { Router } from 'express';
import axios from 'axios';
import { pool } from '../lib/database';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { PinterestService } from '../services/pinterest';

const router = Router();

const PINTEREST_CLIENT_ID = process.env.PINTEREST_CLIENT_ID || '';
const PINTEREST_CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET || '';
const PINTEREST_REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || 'https://socialautoupload.com/api/oauth/pinterest/callback';

/**
 * Step 1: Initiate Pinterest OAuth
 * GET /api/oauth/pinterest
 */
router.get('/oauth/pinterest', requireAuth, (req: AuthRequest, res) => {
  if (!PINTEREST_CLIENT_ID) {
    return res.status(500).json({ error: 'Pinterest Client ID not configured' });
  }

  const state = Buffer.from(JSON.stringify({
    userId: req.user!.id,
    timestamp: Date.now()
  })).toString('base64');

  const scopes = [
    'boards:read',
    'boards:write',
    'pins:read',
    'pins:write',
    'user_accounts:read'
  ].join(',');

  const authUrl = `https://www.pinterest.com/oauth/?` +
    `client_id=${PINTEREST_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(PINTEREST_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${state}`;

  console.log('[Pinterest OAuth] Redirecting to:', authUrl);
  res.json({ url: authUrl });
});

/**
 * Step 2: Handle Pinterest OAuth callback
 * GET /api/oauth/pinterest/callback
 */
router.get('/oauth/pinterest/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error('[Pinterest OAuth] Error:', error);
    return res.redirect(`/channels?error=pinterest&message=${error}`);
  }

  if (!code || !state) {
    return res.redirect('/channels?error=pinterest&message=missing_params');
  }

  try {
    // Decode state to get user ID
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const userId = stateData.userId;

    console.log('[Pinterest OAuth] Exchanging code for token...');

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      'https://api.pinterest.com/v5/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: PINTEREST_REDIRECT_URI
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${PINTEREST_CLIENT_ID}:${PINTEREST_CLIENT_SECRET}`).toString('base64')
        }
      }
    );

    const { access_token, refresh_token, expires_in, token_type } = tokenResponse.data;

    console.log('[Pinterest OAuth] Token received, fetching user info...');

    // Get user info
    const userInfo = await PinterestService.getUserInfo(access_token);

    if (!userInfo.success || !userInfo.user) {
      throw new Error('Failed to get user info');
    }

    const { username, profileImage } = userInfo.user;

    console.log('[Pinterest OAuth] User:', username);

    // Save to database
    const result = await pool.query(
      `INSERT INTO connected_channels 
       (user_id, platform, account_name, account_handle, access_token, refresh_token, token_expires_at, is_active, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '${expires_in} seconds', true, $7)
       ON CONFLICT (user_id, platform, account_handle) 
       DO UPDATE SET 
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         token_expires_at = EXCLUDED.token_expires_at,
         is_active = true,
         metadata = EXCLUDED.metadata,
         updated_at = NOW()
       RETURNING id`,
      [
        userId,
        'pinterest',
        username,
        username,
        access_token,
        refresh_token,
        JSON.stringify({
          profile_image: profileImage,
          token_type
        })
      ]
    );

    console.log('[Pinterest OAuth] Channel connected:', result.rows[0].id);

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (user_id, type, message, platform, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        'success',
        'Pinterest account connected successfully',
        'pinterest',
        JSON.stringify({ username })
      ]
    );

    res.redirect('/channels?success=pinterest');
  } catch (error: any) {
    console.error('[Pinterest OAuth] Error:', error.response?.data || error.message);
    res.redirect(`/channels?error=pinterest&message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Refresh Pinterest access token
 * POST /api/oauth/pinterest/refresh
 */
router.post('/oauth/pinterest/refresh', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { channelId } = req.body;

    // Get channel from database
    const channelResult = await pool.query(
      'SELECT * FROM connected_channels WHERE id = $1 AND user_id = $2 AND platform = $3',
      [channelId, req.user!.id, 'pinterest']
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channel = channelResult.rows[0];

    // Refresh token
    const tokenResponse = await axios.post(
      'https://api.pinterest.com/v5/oauth/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: channel.refresh_token
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${PINTEREST_CLIENT_ID}:${PINTEREST_CLIENT_SECRET}`).toString('base64')
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Update in database
    await pool.query(
      `UPDATE connected_channels 
       SET access_token = $1, 
           refresh_token = $2, 
           token_expires_at = NOW() + INTERVAL '${expires_in} seconds',
           updated_at = NOW()
       WHERE id = $3`,
      [access_token, refresh_token, channelId]
    );

    console.log('[Pinterest OAuth] Token refreshed for channel:', channelId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Pinterest OAuth] Refresh error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Get Pinterest boards for a connected account
 * GET /api/pinterest/boards/:channelId
 */
router.get('/pinterest/boards/:channelId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { channelId } = req.params;

    // Get channel from database
    const channelResult = await pool.query(
      'SELECT * FROM connected_channels WHERE id = $1 AND user_id = $2 AND platform = $3',
      [channelId, req.user!.id, 'pinterest']
    );

    if (channelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channel = channelResult.rows[0];

    // Get boards
    const result = await PinterestService.getBoards(channel.access_token);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ boards: result.boards });
  } catch (error: any) {
    console.error('[Pinterest] Get boards error:', error);
    res.status(500).json({ error: 'Failed to get boards' });
  }
});

/**
 * Disconnect Pinterest account
 * DELETE /api/oauth/pinterest/:channelId
 */
router.delete('/oauth/pinterest/:channelId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { channelId } = req.params;

    await pool.query(
      'UPDATE connected_channels SET is_active = false WHERE id = $1 AND user_id = $2',
      [channelId, req.user!.id]
    );

    console.log('[Pinterest OAuth] Channel disconnected:', channelId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('[Pinterest OAuth] Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect channel' });
  }
});

export default router;
