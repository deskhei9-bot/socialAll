import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

export interface YoutubeDLResult {
  success: boolean;
  filePath?: string;
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  error?: string;
}

/**
 * Check if yt-dlp is installed
 */
export async function checkYtDlpInstalled(): Promise<boolean> {
  try {
    await execAsync('which yt-dlp');
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/,
    /youtube\.com\/embed\/([^&\?\/]+)/,
    /youtube\.com\/v\/([^&\?\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Check if URL is a YouTube video
 */
export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

/**
 * Check if URL is a TikTok video
 */
export function isTikTokUrl(url: string): boolean {
  return /(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/.test(url);
}

/**
 * Check if URL is a Twitter/X video
 */
export function isTwitterUrl(url: string): boolean {
  return /(twitter\.com|x\.com)/.test(url);
}

/**
 * Check if URL is a Facebook video
 */
export function isFacebookUrl(url: string): boolean {
  return /(facebook\.com|fb\.watch|fb\.com)/.test(url);
}

/**
 * Check if URL is an Instagram post
 */
export function isInstagramUrl(url: string): boolean {
  return /instagram\.com/.test(url);
}

/**
 * Check if URL is a Telegram post
 */
export function isTelegramUrl(url: string): boolean {
  return /t\.me/.test(url);
}

/**
 * Check if URL is a Weibo (微博) post
 */
export function isWeiboUrl(url: string): boolean {
  return /weibo\.com/.test(url);
}

/**
 * Check if URL is a Douyin (抖音 - Chinese TikTok) video
 */
export function isDouyinUrl(url: string): boolean {
  return /douyin\.com/.test(url);
}

/**
 * Check if URL is a Xiaohongshu (小红书 / RED) post
 */
export function isXiaohongshuUrl(url: string): boolean {
  return /(xiaohongshu\.com|xhslink\.com)/.test(url);
}

/**
 * Check if URL is a Pinterest pin
 */
export function isPinterestUrl(url: string): boolean {
  return /pinterest\.com/.test(url);
}

/**
 * Check if URL is a Kuaishou (快手) video
 */
export function isKuaishouUrl(url: string): boolean {
  return /kuaishou\.com/.test(url);
}

/**
 * Check if URL is a Threads post
 */
export function isThreadsUrl(url: string): boolean {
  return /threads\.net/.test(url);
}

/**
 * Get platform name from URL
 */
export function getPlatformName(url: string): string {
  if (isYouTubeUrl(url)) return 'YouTube';
  if (isTikTokUrl(url)) return 'TikTok';
  if (isDouyinUrl(url)) return 'Douyin (抖音)';
  if (isTwitterUrl(url)) return 'Twitter/X';
  if (isFacebookUrl(url)) return 'Facebook';
  if (isInstagramUrl(url)) return 'Instagram';
  if (isTelegramUrl(url)) return 'Telegram';
  if (isWeiboUrl(url)) return 'Weibo (微博)';
  if (isXiaohongshuUrl(url)) return 'Xiaohongshu (小红书)';
  if (isPinterestUrl(url)) return 'Pinterest';
  if (isKuaishouUrl(url)) return 'Kuaishou (快手)';
  if (isThreadsUrl(url)) return 'Threads';
  return 'Unknown Platform';
}

/**
 * Download video using yt-dlp
 * Supports: YouTube, TikTok, Douyin, Twitter, Facebook, Instagram, Telegram, Weibo, Xiaohongshu, Pinterest
 * Not Supported (yet): Kuaishou (快手), Threads
 */
export async function downloadVideo(
  url: string,
  outputDir: string = '/opt/social-symphony/uploads/videos'
): Promise<YoutubeDLResult> {
  try {
    // Check if yt-dlp is installed
    const isInstalled = await checkYtDlpInstalled();
    if (!isInstalled) {
      return {
        success: false,
        error: 'yt-dlp is not installed on the server. Please install it first: pip install yt-dlp',
      };
    }

    // Check for unsupported platforms
    if (isKuaishouUrl(url)) {
      return {
        success: false,
        error: 'Kuaishou (快手) is not yet supported by yt-dlp. Please contact support.',
      };
    }
    
    if (isThreadsUrl(url)) {
      return {
        success: false,
        error: 'Threads is not yet supported by yt-dlp. Please contact support.',
      };
    }

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const outputTemplate = path.join(outputDir, `${timestamp}-${uniqueSuffix}.%(ext)s`);

    // Build yt-dlp command with platform-specific options
    // Prioritize H.264 codec for browser compatibility (avoid AV1)
    let formatOption = '-f "bestvideo[vcodec^=avc1][height<=1080]+bestaudio/bestvideo[height<=1080]+bestaudio/best[height<=1080]"';
    
    // For Instagram, use best available format (it has different format structure)
    if (isInstagramUrl(url)) {
      formatOption = '-f "best[vcodec^=avc1]/best"';
    }
    
    // For Facebook, prioritize H.264 format with fallback (requires ffmpeg to merge)
    if (isFacebookUrl(url)) {
      // Try to get H.264 video first, then fallback to any format up to 1080p
      formatOption = '-f "bestvideo[vcodec^=avc1][height<=1080]+bestaudio/bestvideo[height<=1080]+bestaudio/best"';
    }

    const command = `yt-dlp ${formatOption} \
      --merge-output-format mp4 \
      --no-playlist \
      --max-filesize 500M \
      --postprocessor-args "ffmpeg:-c:v libx264 -preset fast -crf 23 -c:a aac" \
      --output "${outputTemplate}" \
      "${url}"`;

    console.log('[yt-dlp] Downloading from:', getPlatformName(url));
    console.log('[yt-dlp] URL:', url);
    
    let stdout: string, stderr: string;
    try {
      const result = await execAsync(command, {
        timeout: 300000, // 5 minutes
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (execError: any) {
      // Check for specific platform errors
      const errorOutput = execError.stderr || execError.stdout || '';
      
      // Douyin/Chinese platforms often need cookies
      if (errorOutput.includes('Fresh cookies') || errorOutput.includes('cookies are needed')) {
        const platformName = getPlatformName(url);
        throw new Error(
          `${platformName} requires authentication. This platform needs cookies to download videos. ` +
          `Please try:\n` +
          `1. Use the platform's official download feature\n` +
          `2. Copy the video and re-upload it manually\n` +
          `Note: ${platformName} has restrictions on automated downloads.`
        );
      }
      
      // Re-throw for other errors to be handled below
      throw execError;
    }

    console.log('[yt-dlp] Download completed');

    // Find downloaded file
    const files = fs.readdirSync(outputDir).filter(f => f.startsWith(`${timestamp}`));
    
    if (files.length === 0) {
      return {
        success: false,
        error: 'Video downloaded but file not found',
      };
    }

    const filename = files[0];
    const filePath = path.join(outputDir, filename);
    const stats = fs.statSync(filePath);

    // Determine mime type from extension
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
    };

    return {
      success: true,
      filePath,
      filename,
      fileSize: stats.size,
      mimeType: mimeTypes[ext] || 'video/mp4',
    };

  } catch (error: any) {
    console.error('[yt-dlp] Error:', error);

    let errorMessage = 'Failed to download video';
    
    // Check for authentication/cookie requirements
    if (error.message.includes('Fresh cookies') || error.message.includes('authentication') || error.message.includes('requires cookies')) {
      errorMessage = error.message; // Use our custom message
    } else if (error.message.includes('HTTP Error 403')) {
      errorMessage = 'Video is private or restricted';
    } else if (error.message.includes('HTTP Error 404')) {
      errorMessage = 'Video not found';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Download timeout (video may be too large)';
    } else if (error.message.includes('age')) {
      errorMessage = 'Video has age restrictions';
    } else if (error.message.includes('Unsupported URL')) {
      const platformName = getPlatformName(url);
      errorMessage = `This ${platformName} URL format is not supported. Please try using the full/original URL from the platform.`;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get video info without downloading
 */
export async function getVideoInfo(url: string): Promise<{
  title?: string;
  duration?: number;
  thumbnail?: string;
  filesize?: number;
  error?: string;
}> {
  try {
    const command = `yt-dlp --dump-json --no-playlist "${url}"`;
    const { stdout } = await execAsync(command, { timeout: 30000 });
    
    const info = JSON.parse(stdout);
    
    return {
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      filesize: info.filesize || info.filesize_approx,
    };
  } catch (error: any) {
    return {
      error: 'Failed to get video info',
    };
  }
}
