import express from 'express';
import { pool } from '../lib/database';

const router = express.Router();

/**
 * GET /api/publishing-profiles
 * Get all publishing profiles for current user
 */
router.get('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT * FROM publishing_profiles 
       WHERE user_id = $1 
       ORDER BY is_default DESC, name ASC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching publishing profiles:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/publishing-profiles/:id
 * Get single publishing profile
 */
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT * FROM publishing_profiles 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching publishing profile:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/publishing-profiles
 * Create new publishing profile
 */
router.post('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, 
      description, 
      channel_ids, 
      is_default,
      color,
      icon 
    } = req.body;
    
    if (!name || !channel_ids || channel_ids.length === 0) {
      return res.status(400).json({ 
        error: 'Name and at least one channel are required' 
      });
    }
    
    // If setting as default, unset other defaults first
    if (is_default) {
      await pool.query(
        'UPDATE publishing_profiles SET is_default = false WHERE user_id = $1',
        [userId]
      );
    }
    
    const result = await pool.query(
      `INSERT INTO publishing_profiles 
        (user_id, name, description, channel_ids, is_default, color, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId, 
        name, 
        description || null, 
        channel_ids, 
        is_default || false,
        color || '#3b82f6',
        icon || 'folder'
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating publishing profile:', error);
    
    if (error.message.includes('Invalid channel IDs')) {
      return res.status(400).json({ 
        error: 'Some selected channels do not belong to you' 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/publishing-profiles/:id
 * Update publishing profile
 */
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      name, 
      description, 
      channel_ids, 
      is_default,
      color,
      icon 
    } = req.body;
    
    // Check if profile exists and belongs to user
    const existingProfile = await pool.query(
      'SELECT id FROM publishing_profiles WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (existingProfile.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // If setting as default, unset other defaults first
    if (is_default) {
      await pool.query(
        'UPDATE publishing_profiles SET is_default = false WHERE user_id = $1 AND id != $2',
        [userId, id]
      );
    }
    
    const result = await pool.query(
      `UPDATE publishing_profiles 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           channel_ids = COALESCE($3, channel_ids),
           is_default = COALESCE($4, is_default),
           color = COALESCE($5, color),
           icon = COALESCE($6, icon),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, description, channel_ids, is_default, color, icon, id, userId]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating publishing profile:', error);
    
    if (error.message.includes('Invalid channel IDs')) {
      return res.status(400).json({ 
        error: 'Some selected channels do not belong to you' 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/publishing-profiles/:id
 * Delete publishing profile
 */
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM publishing_profiles WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ message: 'Profile deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting publishing profile:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/publishing-profiles/:id/channels
 * Get full channel details for a profile
 */
router.get('/:id/channels', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get profile
    const profileResult = await pool.query(
      'SELECT channel_ids FROM publishing_profiles WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const channelIds = profileResult.rows[0].channel_ids;
    
    if (channelIds.length === 0) {
      return res.json([]);
    }
    
    // Get channel details
    const channelsResult = await pool.query(
      'SELECT * FROM connected_channels WHERE id = ANY($1) AND user_id = $2 ORDER BY platform, account_name',
      [channelIds, userId]
    );
    
    res.json(channelsResult.rows);
  } catch (error: any) {
    console.error('Error fetching profile channels:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
