import express from 'express';
import { pool } from '../lib/database';
import crypto from 'crypto';

const router = express.Router();

/**
 * Generate content hash for duplicate detection
 */
function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content.trim().toLowerCase()).digest('hex');
}

/**
 * POST /api/posts/check-duplicate
 * Check if similar post exists
 */
router.post('/check-duplicate', async (req: any, res) => {
  const userId = req.user.id;
  const { content, platforms } = req.body;

  try {
    if (!content || !content.trim()) {
      return res.json({ isDuplicate: false, matches: [] });
    }

    const contentHash = generateContentHash(content);

    // Check for exact content matches in last 30 days
    const result = await pool.query(
      `SELECT p.id, p.content, p.status, p.platforms, p.created_at,
              COUNT(pr.id) as publish_count
       FROM posts p
       LEFT JOIN post_results pr ON pr.post_id = p.id AND pr.status = 'success'
       WHERE p.user_id = $1
         AND p.created_at > NOW() - INTERVAL '30 days'
         AND MD5(LOWER(TRIM(p.content))) = MD5(LOWER(TRIM($2)))
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT 5`,
      [userId, content]
    );

    const matches = result.rows;

    // Check if any matches share platforms
    let hasConflict = false;
    let conflictingPlatforms: string[] = [];

    if (platforms && platforms.length > 0) {
      for (const match of matches) {
        const matchPlatforms = match.platforms || [];
        const overlap = platforms.filter((p: string) => matchPlatforms.includes(p));
        if (overlap.length > 0) {
          hasConflict = true;
          conflictingPlatforms = [...new Set([...conflictingPlatforms, ...overlap])];
        }
      }
    }

    res.json({
      isDuplicate: matches.length > 0,
      hasConflict,
      conflictingPlatforms,
      matches: matches.map(m => ({
        id: m.id,
        content: m.content.substring(0, 100),
        status: m.status,
        platforms: m.platforms,
        created_at: m.created_at,
        publish_count: parseInt(m.publish_count),
      })),
    });
  } catch (error: any) {
    console.error('Duplicate check error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
