import express from 'express';
import { pool } from '../lib/database';
import { findSimilarContent } from '../lib/content-hash';

const router = express.Router();

// Get all posts for current user
router.get('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT * FROM posts 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single post
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT * FROM posts 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new post
router.post('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { 
      title, 
      content, 
      platforms, 
      status, 
      scheduled_at,
      scheduled_for, // legacy support 
      media_url, 
      media_urls,
      media_type, 
      metadata, 
      post_type,
      selected_channel_ids // NEW: Array of channel IDs to publish to
    } = req.body;
    
    console.log('📝 Creating post:', {
      userId,
      post_type,
      media_url,
      media_urls,
      media_urls_length: media_urls?.length,
      platforms,
      content: content?.substring(0, 50)
    });
    
    const result = await pool.query(
      `INSERT INTO posts (
        user_id, title, content, platforms, status, 
        scheduled_at, media_url, media_urls, media_type, metadata, post_type,
        selected_channel_ids
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        userId, 
        title, 
        content, 
        platforms || [], 
        status || 'draft', 
        scheduled_at || scheduled_for, // support both field names
        media_url, 
        media_urls || [],
        media_type, 
        metadata || {}, 
        post_type || 'text',
        selected_channel_ids || [] // Default to empty array
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update post
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      title, 
      content, 
      platforms, 
      status, 
      scheduled_at,
      scheduled_for,
      media_url, 
      media_urls,
      media_type, 
      metadata, 
      post_type,
      selected_channel_ids 
    } = req.body;
    
    const result = await pool.query(
      `UPDATE posts 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           platforms = COALESCE($3, platforms),
           status = COALESCE($4, status),
           scheduled_at = COALESCE($5, $6, scheduled_at),
           media_url = COALESCE($7, media_url),
           media_urls = COALESCE($8, media_urls),
           media_type = COALESCE($9, media_type),
           metadata = COALESCE($10, metadata),
           post_type = COALESCE($11, post_type),
           selected_channel_ids = COALESCE($12, selected_channel_ids),
           updated_at = NOW()
       WHERE id = $13 AND user_id = $14
       RETURNING *`,
      [
        title, 
        content, 
        platforms, 
        status, 
        scheduled_at, 
        scheduled_for, // legacy support
        media_url, 
        media_urls,
        media_type, 
        metadata, 
        post_type, 
        selected_channel_ids,
        id, 
        userId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete post
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check for duplicate/similar content
router.post('/check-duplicate', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length < 10) {
      return res.json({ similar: [] });
    }

    // Get user's recent posts (last 30 days)
    const result = await pool.query(
      `SELECT id, content, created_at, platforms
       FROM posts 
       WHERE user_id = $1 
         AND created_at >= NOW() - INTERVAL '30 days'
       ORDER BY created_at DESC`,
      [userId]
    );

    const similar = findSimilarContent(content, result.rows);

    res.json({ 
      similar: similar.map(s => ({
        id: s.post.id,
        content: s.post.content.substring(0, 100),
        similarity: Math.round(s.similarity * 100),
        created_at: s.post.created_at,
        platforms: s.post.platforms,
      }))
    });
  } catch (error: any) {
    console.error('Error checking duplicates:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
