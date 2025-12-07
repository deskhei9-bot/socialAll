import express from 'express';
import { pool } from '../lib/database';
import { TokenRefreshService } from '../services/token-refresh';

const router = express.Router();

// Map database fields to frontend expected fields
const mapChannelToFrontend = (row: any) => ({
  id: row.id,
  user_id: row.user_id,
  platform: row.platform,
  account_name: row.channel_name || row.account_name,
  account_handle: row.account_handle || '',
  account_id: row.channel_id || row.account_id,
  followers_count: row.followers_count || 0,
  is_active: row.is_active,
  status: row.is_active ? 'connected' : 'disconnected',
  access_token: row.access_token,
  refresh_token: row.refresh_token,
  token_expires_at: row.token_expires_at,
  created_at: row.created_at,
  updated_at: row.updated_at,
  metadata: row.metadata,
});

// Get all channels for current user
router.get('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT * FROM connected_channels 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    const channels = result.rows.map(mapChannelToFrontend);
    res.json(channels);
  } catch (error: any) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new channel
router.post('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { 
      platform, 
      channel_name,
      account_name,
      channel_id,
      account_id,
      account_handle,
      followers_count,
      access_token,
      refresh_token,
      token_expires_at,
      is_active,
      metadata
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO connected_channels 
        (user_id, platform, channel_name, channel_id, account_handle, followers_count, 
         access_token, refresh_token, token_expires_at, is_active, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [userId, platform, channel_name || account_name, channel_id || account_id, 
       account_handle || '', followers_count || 0, access_token, refresh_token, 
       token_expires_at, is_active !== false, metadata || {}]
    );
    
    res.status(201).json(mapChannelToFrontend(result.rows[0]));
  } catch (error: any) {
    console.error('Error adding channel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update channel
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      channel_name,
      account_name,
      channel_id,
      account_id,
      account_handle,
      followers_count,
      is_active,
      access_token,
      refresh_token,
      token_expires_at,
      metadata
    } = req.body;
    
    const result = await pool.query(
      `UPDATE connected_channels 
       SET channel_name = COALESCE($1, channel_name),
           channel_id = COALESCE($2, channel_id),
           account_handle = COALESCE($3, account_handle),
           followers_count = COALESCE($4, followers_count),
           is_active = COALESCE($5, is_active),
           access_token = COALESCE($6, access_token),
           refresh_token = COALESCE($7, refresh_token),
           token_expires_at = COALESCE($8, token_expires_at),
           metadata = COALESCE($9, metadata),
           updated_at = NOW()
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [channel_name || account_name, channel_id || account_id, account_handle, 
       followers_count, is_active, access_token, refresh_token, 
       token_expires_at, metadata, id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    res.json(mapChannelToFrontend(result.rows[0]));
  } catch (error: any) {
    console.error('Error updating channel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete channel
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM connected_channels WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    res.json({ message: 'Channel deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting channel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refresh token for channel
router.post('/:id/refresh', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM connected_channels WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    const channel = result.rows[0];
    
    // Use the token refresh service
    const refreshResult = await TokenRefreshService.refreshChannelToken(channel);
    
    if (refreshResult.success) {
      // Fetch updated channel
      const updatedResult = await pool.query(
        'SELECT * FROM connected_channels WHERE id = $1',
        [id]
      );
      
      res.json({ 
        message: 'Token refreshed successfully', 
        channel: mapChannelToFrontend(updatedResult.rows[0]),
        newExpiresAt: refreshResult.newExpiresAt 
      });
    } else {
      res.status(400).json({ 
        error: refreshResult.error || 'Token refresh failed',
        channel: mapChannelToFrontend(channel)
      });
    }
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refresh all expired tokens for user
router.post('/refresh-all', async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT * FROM connected_channels 
       WHERE user_id = $1 
       AND is_active = true 
       AND token_expires_at IS NOT NULL 
       AND token_expires_at <= NOW() + INTERVAL '${TokenRefreshService.REFRESH_DAYS_BEFORE} days'`,
      [userId]
    );
    
    const results = [];
    
    for (const channel of result.rows) {
      const refreshResult = await TokenRefreshService.refreshChannelToken(channel);
      results.push({
        channelId: channel.id,
        platform: channel.platform,
        accountName: channel.channel_name,
        success: refreshResult.success,
        error: refreshResult.error,
        newExpiresAt: refreshResult.newExpiresAt,
      });
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.json({ 
      message: `Refreshed ${successCount}/${results.length} tokens`,
      results 
    });
  } catch (error: any) {
    console.error('Error refreshing all tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
