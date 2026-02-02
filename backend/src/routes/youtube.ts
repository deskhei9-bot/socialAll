import express from 'express';
import { pool } from '../lib/database';

const router = express.Router();

/**
 * GET /api/youtube/quota
 * Get current YouTube API quota usage for today
 */
router.get('/quota', async (req: any, res) => {
  const userId = req.user?.id;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Query YouTube publishes today
    const result = await pool.query(
      `SELECT COUNT(*) as video_count
       FROM post_results pr
       JOIN posts p ON p.id = pr.post_id
       WHERE p.user_id = $1
         AND pr.platform = 'youtube'
         AND pr.status = 'success'
         AND pr.created_at >= $2
         AND pr.created_at < $3`,
      [userId, today, tomorrow]
    );

    const videosPublished = parseInt(result.rows[0]?.video_count || '0');

    // YouTube quota calculation
    // Video upload costs approximately 1600 units
    // Daily limit is 10,000 units
    const UPLOAD_COST = 1600;
    const DAILY_LIMIT = 10000;
    const used = videosPublished * UPLOAD_COST;
    const remaining = Math.max(0, DAILY_LIMIT - used);

    // Calculate reset time (midnight Pacific Time)
    const resetTime = new Date(tomorrow);
    resetTime.setHours(0, 0, 0, 0);
    // Convert to Pacific Time (UTC-8 or UTC-7 depending on DST)
    // For simplicity, using UTC-8
    const pacificReset = new Date(resetTime.getTime() - (8 * 60 * 60 * 1000));

    res.json({
      dailyLimit: DAILY_LIMIT,
      used,
      remaining,
      videosPublished,
      resetTime: pacificReset.toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching YouTube quota:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
