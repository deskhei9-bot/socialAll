import { pool } from '../lib/database';
import fs from 'fs';
import path from 'path';

/**
 * Media Cleanup Service
 * Automatically deletes media files after successful post publishing
 */

interface CleanupOptions {
  delay?: number; // Delay in milliseconds before cleanup (default: 5 minutes)
  immediate?: boolean; // Clean up immediately after post
}

/**
 * Clean up media files associated with a post after publishing
 */
export async function cleanupPostMedia(
  postId: string,
  options: CleanupOptions = {}
): Promise<void> {
  const delay = options.immediate ? 0 : (options.delay || 5 * 60 * 1000); // Default 5 minutes

  // Schedule cleanup
  setTimeout(async () => {
    try {
      console.log(`[Media Cleanup] Starting cleanup for post ${postId}...`);

      // Get post details
      const postResult = await pool.query(
        'SELECT * FROM posts WHERE id = $1',
        [postId]
      );

      if (postResult.rows.length === 0) {
        console.log(`[Media Cleanup] Post ${postId} not found`);
        return;
      }

      const post = postResult.rows[0];
      
      // Only cleanup if post was successfully published
      if (post.status !== 'published') {
        console.log(`[Media Cleanup] Post ${postId} status is ${post.status}, skipping cleanup`);
        return;
      }

      // Check if all platforms were successful
      const resultsCheck = await pool.query(
        `SELECT COUNT(*) as total, 
                COUNT(CASE WHEN status = 'success' THEN 1 END) as successful
         FROM post_results
         WHERE post_id = $1`,
        [postId]
      );

      const { total, successful } = resultsCheck.rows[0];
      
      if (total === 0) {
        console.log(`[Media Cleanup] No publishing results found for post ${postId}`);
        return;
      }

      if (successful < total) {
        console.log(`[Media Cleanup] Not all platforms successful (${successful}/${total}), keeping media`);
        return;
      }

      // Get media URLs from post
      const mediaUrls = post.media_urls || [];
      let deletedCount = 0;
      let deletedSize = 0;

      for (const mediaUrl of mediaUrls) {
        try {
          // Extract file path from URL
          // URL format: https://socialautoupload.com/uploads/videos/filename.mp4
          const urlPath = mediaUrl.replace(/^https?:\/\/[^\/]+\/uploads/, '');
          const filePath = path.join('/opt/social-symphony/uploads', urlPath);

          // Check if file exists
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const fileSize = stats.size;

            // Delete the file
            fs.unlinkSync(filePath);
            deletedCount++;
            deletedSize += fileSize;

            console.log(`[Media Cleanup] Deleted: ${filePath} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

            // Delete from media_uploads table
            await pool.query(
              'DELETE FROM media_uploads WHERE file_path = $1',
              [urlPath]
            );
          } else {
            console.log(`[Media Cleanup] File not found: ${filePath}`);
          }
        } catch (error: any) {
          console.error(`[Media Cleanup] Error deleting media ${mediaUrl}:`, error.message);
        }
      }

      if (deletedCount > 0) {
        console.log(
          `[Media Cleanup] Completed for post ${postId}: ` +
          `${deletedCount} files deleted, ` +
          `${(deletedSize / 1024 / 1024).toFixed(2)} MB freed`
        );

        // Update post metadata to mark media as cleaned
        await pool.query(
          `UPDATE posts 
           SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"media_cleaned": true, "cleaned_at": $1}'::jsonb
           WHERE id = $2`,
          [new Date().toISOString(), postId]
        );
      } else {
        console.log(`[Media Cleanup] No files deleted for post ${postId}`);
      }

    } catch (error: any) {
      console.error(`[Media Cleanup] Error cleaning up post ${postId}:`, error.message);
    }
  }, delay);

  if (delay > 0) {
    console.log(`[Media Cleanup] Scheduled cleanup for post ${postId} in ${delay / 1000} seconds`);
  }
}

/**
 * Clean up orphaned media files (files not associated with any post)
 */
export async function cleanupOrphanedMedia(): Promise<void> {
  console.log('[Media Cleanup] Starting orphaned media cleanup...');

  try {
    const videosDir = '/opt/social-symphony/uploads/videos';
    const imagesDir = '/opt/social-symphony/uploads/images';

    let deletedCount = 0;
    let deletedSize = 0;

    // Get all media files from database
    const dbMediaResult = await pool.query(
      'SELECT file_path FROM media_uploads'
    );
    const dbMediaPaths = new Set(dbMediaResult.rows.map(row => row.file_path));

    // Check videos directory
    if (fs.existsSync(videosDir)) {
      const videoFiles = fs.readdirSync(videosDir);
      
      for (const filename of videoFiles) {
        const filePath = path.join(videosDir, filename);
        const relativePath = `/videos/${filename}`;

        // Check if file is in database
        if (!dbMediaPaths.has(relativePath)) {
          const stats = fs.statSync(filePath);
          fs.unlinkSync(filePath);
          deletedCount++;
          deletedSize += stats.size;
          console.log(`[Media Cleanup] Deleted orphaned file: ${filePath}`);
        }
      }
    }

    // Check images directory
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir);
      
      for (const filename of imageFiles) {
        const filePath = path.join(imagesDir, filename);
        const relativePath = `/images/${filename}`;

        if (!dbMediaPaths.has(relativePath)) {
          const stats = fs.statSync(filePath);
          fs.unlinkSync(filePath);
          deletedCount++;
          deletedSize += stats.size;
          console.log(`[Media Cleanup] Deleted orphaned file: ${filePath}`);
        }
      }
    }

    console.log(
      `[Media Cleanup] Orphaned cleanup complete: ` +
      `${deletedCount} files deleted, ` +
      `${(deletedSize / 1024 / 1024).toFixed(2)} MB freed`
    );

  } catch (error: any) {
    console.error('[Media Cleanup] Error during orphaned media cleanup:', error.message);
  }
}

/**
 * Get cleanup statistics
 */
export async function getCleanupStats(): Promise<{
  totalPosts: number;
  cleanedPosts: number;
  totalMediaFiles: number;
  totalMediaSize: number;
}> {
  try {
    // Count total posts
    const postsResult = await pool.query(
      "SELECT COUNT(*) as total FROM posts WHERE status = 'published'"
    );
    const totalPosts = parseInt(postsResult.rows[0].total);

    // Count cleaned posts
    const cleanedResult = await pool.query(
      "SELECT COUNT(*) as total FROM posts WHERE metadata->>'media_cleaned' = 'true'"
    );
    const cleanedPosts = parseInt(cleanedResult.rows[0].total);

    // Count remaining media files
    const mediaResult = await pool.query(
      'SELECT COUNT(*) as total, SUM(file_size) as total_size FROM media_uploads'
    );
    const totalMediaFiles = parseInt(mediaResult.rows[0].total || '0');
    const totalMediaSize = parseInt(mediaResult.rows[0].total_size || '0');

    return {
      totalPosts,
      cleanedPosts,
      totalMediaFiles,
      totalMediaSize,
    };
  } catch (error: any) {
    console.error('[Media Cleanup] Error getting cleanup stats:', error.message);
    return {
      totalPosts: 0,
      cleanedPosts: 0,
      totalMediaFiles: 0,
      totalMediaSize: 0,
    };
  }
}

export const MediaCleanupService = {
  cleanupPostMedia,
  cleanupOrphanedMedia,
  getCleanupStats,
};
