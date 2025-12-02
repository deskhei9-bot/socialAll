import { Router, Request, Response } from 'express';
import { pool } from '../lib/database';

const router = Router();

// Get all scheduled posts for the authenticated user
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const result = await pool.query(
      `SELECT 
        p.id,
        p.title,
        p.content,
        p.media_urls,
        p.platforms,
        p.scheduled_at,
        p.status,
        p.created_at,
        p.updated_at
      FROM posts p
      WHERE p.user_id = $1 
        AND p.status IN ('scheduled', 'pending')
      ORDER BY p.scheduled_at ASC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled posts' });
  }
});

// Get upcoming scheduled posts (next 7 days)
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const result = await pool.query(
      `SELECT 
        p.id,
        p.title,
        p.content,
        p.media_urls,
        p.platforms,
        p.scheduled_at,
        p.status,
        p.created_at
      FROM posts p
      WHERE p.user_id = $1 
        AND p.status = 'scheduled'
        AND p.scheduled_at BETWEEN $2 AND $3
      ORDER BY p.scheduled_at ASC`,
      [userId, now, next7Days]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming posts:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming posts' });
  }
});

// Cancel a scheduled post
router.delete('/posts/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const postId = req.params.id;

    const result = await pool.query(
      `UPDATE posts 
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'scheduled'
       RETURNING *`,
      [postId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scheduled post not found or already processed' });
    }

    res.json({ message: 'Post cancelled successfully', post: result.rows[0] });
  } catch (error) {
    console.error('Error cancelling scheduled post:', error);
    res.status(500).json({ error: 'Failed to cancel scheduled post' });
  }
});

// Reschedule a post
router.put('/posts/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const postId = req.params.id;
    const { scheduled_for } = req.body;

    if (!scheduled_for) {
      return res.status(400).json({ error: 'Scheduled time is required' });
    }

    const scheduledDate = new Date(scheduled_for);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const result = await pool.query(
      `UPDATE posts 
       SET scheduled_at = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 AND status = 'scheduled'
       RETURNING *`,
      [scheduledDate, postId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scheduled post not found or already processed' });
    }

    res.json({ message: 'Post rescheduled successfully', post: result.rows[0] });
  } catch (error) {
    console.error('Error rescheduling post:', error);
    res.status(500).json({ error: 'Failed to reschedule post' });
  }
});

export default router;
