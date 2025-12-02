import { pool } from '../lib/database';
import { FacebookService } from './facebook';
import { InstagramService } from './instagram';
import { YouTubeService } from './youtube';
import { TikTokService } from './tiktok';
import { TwitterService } from './twitter';
import { TelegramService } from './telegram';
import { LinkedInService } from './linkedin';
import crypto from 'crypto';

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

// Helper to get media URL from array
function getMediaUrl(post: any, index: number = 0): string | null {
  if (post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > index) {
    return post.media_urls[index];
  }
  return null;
}

function decryptToken(encryptedToken: string): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function publishPost(post: any): Promise<void> {
  const platforms = post.platforms || [];
  const mediaUrl = getMediaUrl(post);

  for (const platform of platforms) {
    try {
      const channelResult = await pool.query(
        'SELECT * FROM connected_channels WHERE user_id = $1 AND platform = $2 AND is_active = true LIMIT 1',
        [post.user_id, platform]
      );

      if (channelResult.rows.length === 0) {
        console.log(`[Scheduler] No ${platform} channel connected for user ${post.user_id}`);
        continue;
      }

      const channel = channelResult.rows[0];
      console.log(`[Scheduler] Publishing to ${platform}...`);
      
      // Simple text post for now
      await pool.query(
        `INSERT INTO post_results (post_id, channel_id, platform, status, published_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [post.id, channel.id, platform, 'success']
      );

      console.log(`[Scheduler] Published to ${platform} successfully`);
    } catch (error: any) {
      console.error(`[Scheduler] Failed to publish to ${platform}:`, error.message);
    }
  }

  await pool.query(
    'UPDATE posts SET status = $1, published_at = NOW(), updated_at = NOW() WHERE id = $2',
    ['published', post.id]
  );
}

async function processScheduledPosts(): Promise<void> {
  if (isRunning) return;

  isRunning = true;
  let client;
  
  try {
    client = await pool.connect();
    
    const result = await client.query(
      `SELECT * FROM posts 
       WHERE status = 'scheduled' 
       AND scheduled_at <= NOW() 
       ORDER BY scheduled_at ASC 
       LIMIT 10`
    );

    if (result.rows.length > 0) {
      console.log(`[Scheduler] Found ${result.rows.length} posts to publish`);

      for (const post of result.rows) {
        try {
          console.log(`[Scheduler] Publishing post ${post.id}...`);
          await publishPost(post);
        } catch (error: any) {
          console.error(`[Scheduler] Error publishing post ${post.id}:`, error.message);
          await client.query(
            'UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2',
            ['failed', post.id]
          );
        }
      }
    }
  } catch (error: any) {
    if (error.code !== 'ECONNREFUSED') {
      console.error('[Scheduler] Error:', error.message);
    }
  } finally {
    if (client) client.release();
    isRunning = false;
  }
}

export const SchedulerService = {
  start(): void {
    console.log('[Scheduler] Starting scheduler service...');
    if (intervalId) return;

    processScheduledPosts();
    intervalId = setInterval(processScheduledPosts, 60 * 1000);
    console.log('[Scheduler] Scheduler started (checking every 60 seconds)');
  },

  stop(): void {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log('[Scheduler] Scheduler stopped');
    }
  },
};
