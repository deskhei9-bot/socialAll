import express from 'express';
import axios from 'axios';
import { pool } from '../lib/database';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { 
  isYouTubeUrl, 
  isTikTokUrl, 
  isTwitterUrl,
  isFacebookUrl,
  isInstagramUrl,
  isTelegramUrl,
  isWeiboUrl,
  isDouyinUrl,
  isXiaohongshuUrl,
  isPinterestUrl,
  isKuaishouUrl,
  isThreadsUrl,
  getPlatformName,
  downloadVideo,
  checkYtDlpInstalled 
} from '../services/youtube-dl';

const router = express.Router();
const streamPipeline = promisify(pipeline);

/**
 * Validate URL format
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Get file extension from URL or content-type
 */
function getFileExtension(url: string, contentType?: string): string {
  // Try from URL first
  const urlPath = new URL(url).pathname;
  const urlExt = path.extname(urlPath);
  if (urlExt) return urlExt;

  // Fallback to content-type
  if (contentType) {
    const typeMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/quicktime': '.mov',
      'video/webm': '.webm',
      'video/x-msvideo': '.avi',
    };
    return typeMap[contentType] || '.bin';
  }

  return '.bin';
}

/**
 * Determine media type from content-type
 */
function getMediaType(contentType: string): 'image' | 'video' | null {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  return null;
}

/**
 * POST /api/upload/from-url
 * Download media from URL and save
 * Supports: Direct media URLs, YouTube, TikTok
 */
router.post('/from-url', async (req: any, res) => {
  try {
    const { url } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if it's a social media video URL
    const isSocialMedia = isYouTubeUrl(url) || isTikTokUrl(url) || isTwitterUrl(url) || 
                          isFacebookUrl(url) || isInstagramUrl(url) || isTelegramUrl(url) ||
                          isWeiboUrl(url) || isDouyinUrl(url) || isXiaohongshuUrl(url) || 
                          isPinterestUrl(url) || isKuaishouUrl(url) || isThreadsUrl(url);
    
    if (isSocialMedia) {
      const platformName = getPlatformName(url);
      console.log(`[Social Media] Detected ${platformName} URL: ${url}`);
      
      // Check if yt-dlp is installed
      const ytDlpInstalled = await checkYtDlpInstalled();
      if (!ytDlpInstalled) {
        return res.status(400).json({ 
          error: 'Social media video download not available',
          details: 'Server does not have yt-dlp installed. Please use direct media URLs or download the video manually.',
          suggestion: `You can download ${platformName} videos using online tools, then upload the file directly.`
        });
      }

      // Download video using yt-dlp
      const result = await downloadVideo(url);
      
      if (!result.success || !result.filePath) {
        return res.status(400).json({ 
          error: result.error || 'Failed to download video',
          details: 'The video could not be downloaded. It may be private, age-restricted, or unavailable.',
          platform: platformName,
        });
      }

      // Get file stats
      const stats = fs.statSync(result.filePath);
      const filename = result.filename!;
      const dbFilePath = `/videos/${filename}`;

      // Detect platform for metadata
      let platform = 'unknown';
      if (isYouTubeUrl(url)) platform = 'youtube';
      else if (isTikTokUrl(url)) platform = 'tiktok';
      else if (isDouyinUrl(url)) platform = 'douyin';
      else if (isTwitterUrl(url)) platform = 'twitter';
      else if (isFacebookUrl(url)) platform = 'facebook';
      else if (isInstagramUrl(url)) platform = 'instagram';
      else if (isTelegramUrl(url)) platform = 'telegram';
      else if (isWeiboUrl(url)) platform = 'weibo';
      else if (isXiaohongshuUrl(url)) platform = 'xiaohongshu';
      else if (isPinterestUrl(url)) platform = 'pinterest';
      else if (isKuaishouUrl(url)) platform = 'kuaishou';
      else if (isThreadsUrl(url)) platform = 'threads';

      // Save to database
      const dbResult = await pool.query(
        `INSERT INTO media_uploads 
          (user_id, filename, file_path, file_size, mime_type, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          userId, 
          filename, 
          dbFilePath, 
          stats.size, 
          result.mimeType || 'video/mp4',
          JSON.stringify({ 
            source_url: url, 
            upload_method: 'social_media', 
            platform,
            platform_name: platformName
          })
        ]
      );

      return res.status(201).json({
        message: `${platformName} video downloaded and uploaded successfully`,
        file: {
          id: dbResult.rows[0].id,
          name: filename,
          path: dbFilePath,
          url: `${process.env.BACKEND_URL || 'https://socialautoupload.com'}/uploads${dbFilePath}`,
          size: stats.size,
          type: 'video',
          mimeType: result.mimeType || 'video/mp4',
          sourceUrl: url,
          platform: platformName,
        }
      });
    }

    // Handle direct media URLs (original logic)
    const headResponse = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
    }).catch(() => null);

    const contentType = headResponse?.headers['content-type'] || '';
    const contentLength = parseInt(headResponse?.headers['content-length'] || '0');

    // Validate content type
    const mediaType = getMediaType(contentType);
    if (!mediaType) {
      return res.status(400).json({ 
        error: 'Unsupported media type. Only images and videos are allowed.' 
      });
    }

    // Validate file size (500MB limit)
    const MAX_SIZE = 500 * 1024 * 1024;
    if (contentLength > MAX_SIZE) {
      return res.status(400).json({ 
        error: `File too large. Maximum size is 500MB. File size: ${(contentLength / 1024 / 1024).toFixed(1)}MB` 
      });
    }

    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const fileExt = getFileExtension(url, contentType);
    const filename = `${Date.now()}-${uniqueSuffix}${fileExt}`;

    // Determine upload directory
    const uploadDir = mediaType === 'video' 
      ? '/opt/social-symphony/uploads/videos'
      : '/opt/social-symphony/uploads/images';

    const filePath = path.join(uploadDir, filename);

    // Download file
    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream',
      timeout: 120000, // 2 minutes
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SocialAutoUpload/1.0)',
      },
    });

    // Save to disk
    await streamPipeline(response.data, fs.createWriteStream(filePath));

    // Get actual file size
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Save to database
    const dbFilePath = `/${mediaType}s/${filename}`;
    const result = await pool.query(
      `INSERT INTO media_uploads 
        (user_id, filename, file_path, file_size, mime_type, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId, 
        filename, 
        dbFilePath, 
        fileSize, 
        contentType,
        JSON.stringify({ source_url: url, upload_method: 'url' })
      ]
    );

    res.status(201).json({
      message: 'File downloaded and uploaded successfully',
      file: {
        id: result.rows[0].id,
        name: filename,
        path: dbFilePath,
        url: `${process.env.BACKEND_URL || 'https://socialautoupload.com'}/uploads${dbFilePath}`,
        size: fileSize,
        type: mediaType,
        mimeType: contentType,
        sourceUrl: url,
      }
    });

  } catch (error: any) {
    console.error('URL upload error:', error);

    let errorMessage = 'Failed to download file from URL';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Download timeout. File may be too large or server is slow.';
    } else if (error.response) {
      errorMessage = `Failed to download: ${error.response.status} ${error.response.statusText}`;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'URL not found or unreachable';
    }

    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

/**
 * POST /api/upload/from-urls
 * Download multiple media from URLs
 */
router.post('/from-urls', async (req: any, res) => {
  try {
    const { urls } = req.body;
    const userId = req.user.id;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    if (urls.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 URLs allowed per request' });
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const url of urls) {
      try {
        if (!isValidUrl(url)) {
          errors.push({ url, error: 'Invalid URL format' });
          continue;
        }

        // Fetch metadata
        const headResponse = await axios.head(url, {
          timeout: 10000,
          maxRedirects: 5,
        }).catch(() => null);

        const contentType = headResponse?.headers['content-type'] || '';
        const contentLength = parseInt(headResponse?.headers['content-length'] || '0');

        const mediaType = getMediaType(contentType);
        if (!mediaType) {
          errors.push({ url, error: 'Unsupported media type' });
          continue;
        }

        const MAX_SIZE = 500 * 1024 * 1024;
        if (contentLength > MAX_SIZE) {
          errors.push({ url, error: 'File too large (max 500MB)' });
          continue;
        }

        // Generate filename
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const fileExt = getFileExtension(url, contentType);
        const filename = `${Date.now()}-${uniqueSuffix}${fileExt}`;

        const uploadDir = mediaType === 'video' 
          ? '/opt/social-symphony/uploads/videos'
          : '/opt/social-symphony/uploads/images';

        const filePath = path.join(uploadDir, filename);

        // Download
        const response = await axios({
          method: 'GET',
          url,
          responseType: 'stream',
          timeout: 120000,
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SocialAutoUpload/1.0)',
          },
        });

        await streamPipeline(response.data, fs.createWriteStream(filePath));

        const stats = fs.statSync(filePath);
        const fileSize = stats.size;

        // Save to DB
        const dbFilePath = `/${mediaType}s/${filename}`;
        const result = await pool.query(
          `INSERT INTO media_uploads 
            (user_id, filename, file_path, file_size, mime_type, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [
            userId, 
            filename, 
            dbFilePath, 
            fileSize, 
            contentType,
            JSON.stringify({ source_url: url, upload_method: 'url' })
          ]
        );

        results.push({
          id: result.rows[0].id,
          name: filename,
          path: dbFilePath,
          url: `${process.env.BACKEND_URL || 'https://socialautoupload.com'}/uploads${dbFilePath}`,
          size: fileSize,
          type: mediaType,
          mimeType: contentType,
          sourceUrl: url,
        });

      } catch (error: any) {
        errors.push({ 
          url, 
          error: error.message || 'Download failed' 
        });
      }
    }

    res.status(results.length > 0 ? 201 : 400).json({
      message: `${results.length} files uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      files: results,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('Batch URL upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process URLs',
      details: error.message 
    });
  }
});

export default router;
