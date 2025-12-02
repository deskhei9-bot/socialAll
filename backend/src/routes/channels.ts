import express from 'express';
import { pool } from '../lib/database';

const router = express.Router();

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
    
    res.json(result.rows);
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
      channel_id,
      access_token,
      refresh_token,
      token_expires_at,
      is_active,
      metadata
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO connected_channels 
        (user_id, platform, channel_name, channel_id, access_token, refresh_token, 
         token_expires_at, is_active, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, platform, channel_name, channel_id, access_token, refresh_token, 
       token_expires_at, is_active !== false, metadata || {}]
    );
    
    res.status(201).json(result.rows[0]);
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
      channel_id,
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
           is_active = COALESCE($3, is_active),
           access_token = COALESCE($4, access_token),
           refresh_token = COALESCE($5, refresh_token),
           token_expires_at = COALESCE($6, token_expires_at),
           metadata = COALESCE($7, metadata),
           updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [channel_name, channel_id, is_active, access_token, refresh_token, 
       token_expires_at, metadata, id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    res.json(result.rows[0]);
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
    
    // TODO: Implement token refresh logic for each platform
    // For now, just return current channel
    res.json({ message: 'Token refresh not yet implemented', channel });
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
