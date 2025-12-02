import { Router, Request, Response } from 'express';
import { pool } from '../lib/database';

const router = Router();

// Get overall analytics for authenticated user
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total posts stats
    const postsStats = await pool.query(
      `SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_posts,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_posts
      FROM posts 
      WHERE user_id = $1 AND created_at >= $2`,
      [userId, startDate]
    );

    // Get publish success rate
    const successRate = postsStats.rows[0].total_posts > 0
      ? Math.round((postsStats.rows[0].published_posts / postsStats.rows[0].total_posts) * 100)
      : 0;

    // Get platform distribution
    const platformStats = await pool.query(
      `SELECT 
        pr.platform,
        COUNT(*) as post_count,
        COUNT(CASE WHEN pr.status = 'success' THEN 1 END) as success_count,
        COUNT(CASE WHEN pr.status = 'failed' THEN 1 END) as failed_count
      FROM post_results pr
      JOIN posts p ON pr.post_id = p.id
      WHERE p.user_id = $1 AND pr.created_at >= $2
      GROUP BY pr.platform
      ORDER BY post_count DESC`,
      [userId, startDate]
    );

    // Get daily post count for chart
    const dailyPosts = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM posts
      WHERE user_id = $1 AND created_at >= $2
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [userId, startDate]
    );

    // Get recent activity
    const recentActivity = await pool.query(
      `SELECT 
        p.id,
        p.title,
        p.content,
        p.status,
        p.created_at,
        p.published_at,
        ARRAY_AGG(DISTINCT pr.platform) as platforms,
        ARRAY_AGG(DISTINCT pr.status) as platform_statuses
      FROM posts p
      LEFT JOIN post_results pr ON p.id = pr.post_id
      WHERE p.user_id = $1 AND p.created_at >= $2
      GROUP BY p.id, p.title, p.content, p.status, p.created_at, p.published_at
      ORDER BY p.created_at DESC
      LIMIT 10`,
      [userId, startDate]
    );

    res.json({
      totalPosts: parseInt(postsStats.rows[0].total_posts),
      publishedPosts: parseInt(postsStats.rows[0].published_posts),
      scheduledPosts: parseInt(postsStats.rows[0].scheduled_posts),
      failedPosts: parseInt(postsStats.rows[0].failed_posts),
      successRate,
      totalReach: 0, // TODO: Integrate with platform APIs for real metrics
      totalEngagement: 0,
      platformStats: platformStats.rows,
      dailyPosts: dailyPosts.rows,
      recentActivity: recentActivity.rows,
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get analytics for a specific post
router.get('/post/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const postId = req.params.id;

    // Get post details
    const postResult = await pool.query(
      `SELECT * FROM posts WHERE id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get platform results
    const platformResults = await pool.query(
      `SELECT 
        pr.*,
        cc.platform,
        cc.channel_name
      FROM post_results pr
      JOIN connected_channels cc ON pr.channel_id = cc.id
      WHERE pr.post_id = $1
      ORDER BY pr.created_at DESC`,
      [postId]
    );

    res.json({
      post: postResult.rows[0],
      platformResults: platformResults.rows,
      // TODO: Add real engagement metrics from platform APIs
      metrics: {
        impressions: 0,
        engagement: 0,
        clicks: 0,
        shares: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    res.status(500).json({ error: 'Failed to fetch post analytics' });
  }
});

// Get platform-specific analytics
router.get('/platform/:platform', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const platform = req.params.platform;
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get posts for this platform
    const platformPosts = await pool.query(
      `SELECT 
        pr.*,
        p.title,
        p.content,
        p.created_at,
        p.published_at
      FROM post_results pr
      JOIN posts p ON pr.post_id = p.id
      WHERE p.user_id = $1 
        AND pr.platform = $2 
        AND pr.created_at >= $3
      ORDER BY pr.created_at DESC`,
      [userId, platform, startDate]
    );

    // Get success/failure stats
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN pr.status = 'success' THEN 1 END) as success,
        COUNT(CASE WHEN pr.status = 'failed' THEN 1 END) as failed
      FROM post_results pr
      JOIN posts p ON pr.post_id = p.id
      WHERE p.user_id = $1 AND pr.platform = $2 AND pr.created_at >= $3`,
      [userId, platform, startDate]
    );

    res.json({
      platform,
      posts: platformPosts.rows,
      stats: stats.rows[0],
      // TODO: Add platform-specific metrics from APIs
      metrics: {
        followers: 0,
        engagement_rate: 0,
        avg_impressions: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
});

// Get time-series data for charts
router.get('/timeseries', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily post counts
    const dailyData = await pool.query(
      `SELECT 
        DATE(p.created_at) as date,
        COUNT(*) as total_posts,
        COUNT(CASE WHEN p.status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN p.status = 'failed' THEN 1 END) as failed
      FROM posts p
      WHERE p.user_id = $1 AND p.created_at >= $2
      GROUP BY DATE(p.created_at)
      ORDER BY date ASC`,
      [userId, startDate]
    );

    // Platform breakdown by day
    const platformData = await pool.query(
      `SELECT 
        DATE(pr.created_at) as date,
        pr.platform,
        COUNT(*) as count
      FROM post_results pr
      JOIN posts p ON pr.post_id = p.id
      WHERE p.user_id = $1 AND pr.created_at >= $2
      GROUP BY DATE(pr.created_at), pr.platform
      ORDER BY date ASC, platform`,
      [userId, startDate]
    );

    res.json({
      daily: dailyData.rows,
      platforms: platformData.rows,
    });
  } catch (error) {
    console.error('Error fetching timeseries data:', error);
    res.status(500).json({ error: 'Failed to fetch timeseries data' });
  }
});

export default router;
