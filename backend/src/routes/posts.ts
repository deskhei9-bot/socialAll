import express from 'express';
import { pool } from '../lib/database';

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
    const { title, content, platforms, status, scheduled_for, media_url, media_type, metadata, post_type } = req.body;
    
    const result = await pool.query(
      `INSERT INTO posts (user_id, title, content, platforms, status, scheduled_for, media_url, media_type, metadata, post_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, title, content, platforms || [], status || 'draft', scheduled_for, media_url, media_type, metadata || {}, post_type || 'text']
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
    const { title, content, platforms, status, scheduled_for, media_url, media_type, metadata, post_type } = req.body;
    
    const result = await pool.query(
      `UPDATE posts 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           platforms = COALESCE($3, platforms),
           status = COALESCE($4, status),
           scheduled_for = COALESCE($5, scheduled_for),
           media_url = COALESCE($6, media_url),
           media_type = COALESCE($7, media_type),
           metadata = COALESCE($8, metadata),
           post_type = COALESCE($9, post_type),
           updated_at = NOW()
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [title, content, platforms, status, scheduled_for, media_url, media_type, metadata, post_type, id, userId]
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

export default router;
