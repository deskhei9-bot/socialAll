import { pool } from '../lib/database';
import { FacebookService } from './facebook';
import { InstagramService } from './instagram';
import { YouTubeService } from './youtube';
import { TikTokService } from './tiktok';
import { TwitterService } from './twitter';
import { TelegramService } from './telegram';
import { LinkedInService } from './linkedin';
import { PinterestService } from './pinterest';
import { MediaCleanupService } from './media-cleanup';
import { TokenRefreshService } from './token-refresh';
import { decryptToken } from '../lib/token-crypto';

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;
let tokenRefreshIntervalId: NodeJS.Timeout | null = null;

function getSmartTitle(post: any, maxLength: number = 100): string {
  if (post.title && post.title.trim()) {
    return post.title.trim().substring(0, maxLength);
  }
  if (post.content) {
    const firstLine = post.content.split('\n')[0].trim();
    if (firstLine) {
      return firstLine.substring(0, maxLength);
    }
  }
  return 'Untitled Post';
}

function getMediaPath(mediaUrl: string): string {
  return mediaUrl.replace('https://socialautoupload.com/uploads/', '/opt/social-symphony/uploads/');
}

async function publishToChannel(post: any, channel: any): Promise<{ success: boolean; result?: any; error?: string }> {
  const platform = channel.platform;
  const accessToken = decryptToken(channel.access_token);
  const channelId = channel.channel_id;
  const postType = post.post_type || 'text';

  try {
    let publishResult: any;

    switch (platform) {
      case 'facebook':
        switch (postType) {
          case 'reel':
            if (post.media_url?.includes('/videos/')) {
              publishResult = await FacebookService.publishReel(accessToken, channelId, getMediaPath(post.media_url), post.content);
            } else {
              throw new Error('Reel requires a video file');
            }
            break;
          case 'album':
            const albumUrls = post.metadata?.media_urls || [];
            if (albumUrls.length > 0) {
              publishResult = await FacebookService.publishPhotoAlbum(accessToken, channelId, albumUrls, post.content);
            } else {
              throw new Error('Album requires multiple photos');
            }
            break;
          case 'link':
            const linkUrl = post.metadata?.link_url || post.media_url;
            if (linkUrl) {
              publishResult = await FacebookService.publishLink(accessToken, channelId, linkUrl, post.content);
            } else {
              throw new Error('Link post requires a URL');
            }
            break;
          case 'video':
            if (post.media_url?.includes('/videos/')) {
              publishResult = await FacebookService.publishVideoPost(accessToken, channelId, getMediaPath(post.media_url), post.content);
            } else {
              throw new Error('Video post requires a video file');
            }
            break;
          case 'photo':
            if (post.media_url?.includes('/images/')) {
              publishResult = await FacebookService.publishPhotoPost(accessToken, channelId, post.media_url, post.content);
            } else {
              throw new Error('Photo post requires an image');
            }
            break;
          default:
            publishResult = await FacebookService.publishTextPost(accessToken, channelId, post.content);
        }
        break;

      case 'instagram':
        const pageId = channel.metadata?.facebook_page_id;
        if (!pageId) throw new Error('Facebook Page ID required for Instagram');
        const igAccountId = await InstagramService.getInstagramAccountId(accessToken, pageId);
        
        switch (postType) {
          case 'photo':
            if (post.media_url) {
              publishResult = await InstagramService.publishPhoto(accessToken, igAccountId, post.media_url, post.content);
            } else {
              throw new Error('Photo post requires an image');
            }
            break;
          case 'carousel':
            const carouselUrls = post.metadata?.media_urls || [];
            if (carouselUrls.length >= 2) {
              publishResult = await InstagramService.publishCarousel(accessToken, igAccountId, carouselUrls, post.content);
            } else {
              throw new Error('Carousel requires at least 2 images');
            }
            break;
          case 'video':
            if (post.media_url) {
              publishResult = await InstagramService.publishVideo(accessToken, igAccountId, post.media_url, post.content);
            } else {
              throw new Error('Video post requires a video file');
            }
            break;
          case 'reel':
            if (post.media_url) {
              publishResult = await InstagramService.publishReel(accessToken, igAccountId, post.media_url, post.content, post.metadata?.cover_url);
            } else {
              throw new Error('Reel requires a video file');
            }
            break;
          case 'story':
            if (post.media_url) {
              const mediaType = post.media_url.includes('/videos/') ? 'VIDEO' : 'IMAGE';
              publishResult = await InstagramService.publishStory(accessToken, igAccountId, post.media_url, mediaType);
            } else {
              throw new Error('Story requires a photo or video');
            }
            break;
          default:
            throw new Error(`Unsupported Instagram post type: ${postType}`);
        }
        break;

      case 'youtube':
        const refreshToken = channel.metadata?.refresh_token;
        if (!refreshToken) throw new Error('Refresh token required for YouTube');
        
        if (postType === 'video' && post.media_url) {
          publishResult = await YouTubeService.uploadVideo(
            accessToken,
            getMediaPath(post.media_url),
            getSmartTitle(post, 100),
            post.content || '',
            post.metadata?.tags || [],
            post.metadata?.category_id || '22',
            post.metadata?.privacy || 'public'
          );
        } else if (postType === 'short' && post.media_url) {
          publishResult = await YouTubeService.uploadShort(
            accessToken,
            getMediaPath(post.media_url),
            getSmartTitle(post, 100),
            post.content || ''
          );
        } else {
          throw new Error('YouTube only supports video and short posts');
        }
        break;

      case 'tiktok':
        if (postType === 'video' && post.media_url) {
          publishResult = await TikTokService.uploadVideo(
            accessToken,
            getMediaPath(post.media_url),
            post.content || '',
            post.metadata?.privacy_level || 'PUBLIC_TO_EVERYONE',
            {
              disableComment: post.metadata?.disable_comment === true,
              disableDuet: post.metadata?.disable_duet === true,
              disableStitch: post.metadata?.disable_stitch === true,
            }
          );
        } else {
          throw new Error('TikTok only supports video posts');
        }
        break;

      case 'twitter':
        const accessSecret = channel.metadata?.access_secret;
        if (!accessSecret) throw new Error('Access secret required for Twitter');
        
        switch (postType) {
          case 'text':
            publishResult = await TwitterService.postTweet(accessToken, accessSecret, post.content);
            break;
          case 'media':
          case 'photo':
          case 'video':
            if (post.media_url) {
              const mediaType = post.media_url.includes('/videos/') ? 'video' : 'photo';
              publishResult = await TwitterService.postTweetWithMedia(accessToken, accessSecret, post.content, post.media_url, mediaType);
            } else {
              throw new Error('Media post requires a file');
            }
            break;
          case 'thread':
            const threadTexts = post.metadata?.thread_texts || [post.content];
            publishResult = await TwitterService.postThread(accessToken, accessSecret, threadTexts);
            break;
          default:
            publishResult = await TwitterService.postTweet(accessToken, accessSecret, post.content);
        }
        break;

      case 'linkedin':
        const linkedinId = channel.metadata?.linkedin_id || channelId;
        const authorUrn = `urn:li:person:${linkedinId}`;
        
        switch (postType) {
          case 'text':
            publishResult = await LinkedInService.postToProfile(accessToken, linkedinId, post.content, 'PUBLIC');
            break;
          case 'photo':
            if (post.media_url) {
              publishResult = await LinkedInService.postWithImage(accessToken, authorUrn, post.content, post.media_url, 'PUBLIC');
            } else {
              throw new Error('Photo post requires an image');
            }
            break;
          case 'video':
            if (post.media_url) {
              publishResult = await LinkedInService.postWithVideo(accessToken, authorUrn, post.content, post.media_url, 'PUBLIC');
            } else {
              throw new Error('Video post requires a video file');
            }
            break;
          case 'article':
            const articleUrl = post.metadata?.article_url || post.media_url;
            if (articleUrl) {
              publishResult = await LinkedInService.postArticle(accessToken, authorUrn, getSmartTitle(post), post.content, articleUrl, 'PUBLIC');
            } else {
              throw new Error('Article post requires a URL');
            }
            break;
          default:
            publishResult = await LinkedInService.postToProfile(accessToken, linkedinId, post.content, 'PUBLIC');
        }
        break;

      case 'pinterest':
        const boardId = channel.metadata?.board_id || post.metadata?.board_id;
        if (!boardId) throw new Error('Board ID required for Pinterest');
        
        if (post.media_url) {
          const pinResult = await PinterestService.createPin({
            accessToken,
            boardId,
            title: getSmartTitle(post, 100),
            description: post.content,
            imageUrl: post.media_url,
            link: post.metadata?.link_url,
          });
          if (pinResult.success) {
            publishResult = { pinId: pinResult.pinId, url: pinResult.pinUrl };
          } else {
            throw new Error(pinResult.error || 'Pinterest publish failed');
          }
        } else {
          throw new Error('Pinterest requires an image');
        }
        break;

      case 'telegram':
        const chatId = channel.channel_id;
        const botToken = decryptToken(channel.metadata?.bot_token || channel.access_token);
        
        switch (postType) {
          case 'photo':
            if (post.media_url) {
              publishResult = await TelegramService.sendPhoto(botToken, chatId, post.media_url, post.content);
            } else {
              throw new Error('Photo post requires an image');
            }
            break;
          case 'video':
            if (post.media_url) {
              publishResult = await TelegramService.sendVideo(botToken, chatId, post.media_url, post.content);
            } else {
              throw new Error('Video post requires a video file');
            }
            break;
          default:
            publishResult = await TelegramService.sendMessage(botToken, chatId, post.content);
        }
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return { success: true, result: publishResult };
  } catch (error: any) {
    console.error(`[Scheduler] ${platform} publish error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function publishPost(post: any): Promise<void> {
  const selectedChannelIds = post.selected_channel_ids || [];
  const platforms = post.platforms || [];
  const results: any[] = [];
  
  let channelsToPublish: any[] = [];
  
  // Get channels to publish to
  if (selectedChannelIds.length > 0) {
    const channelResult = await pool.query(
      'SELECT * FROM connected_channels WHERE id = ANY($1) AND user_id = $2 AND is_active = true',
      [selectedChannelIds, post.user_id]
    );
    channelsToPublish = channelResult.rows;
  } else if (platforms.length > 0) {
    for (const platform of platforms) {
      const channelResult = await pool.query(
        'SELECT * FROM connected_channels WHERE user_id = $1 AND platform = $2 AND is_active = true LIMIT 1',
        [post.user_id, platform]
      );
      if (channelResult.rows.length > 0) {
        channelsToPublish.push(channelResult.rows[0]);
      }
    }
  }

  if (channelsToPublish.length === 0) {
    console.log(`[Scheduler] No channels found for post ${post.id}`);
    await pool.query(
      'UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2',
      ['failed', post.id]
    );
    return;
  }

  // Publish to each channel
  let hasSuccess = false;
  let hasFailure = false;

  for (const channel of channelsToPublish) {
    console.log(`[Scheduler] Publishing to ${channel.platform} (${channel.account_name || channel.channel_name})...`);
    
    const { success, result, error } = await publishToChannel(post, channel);
    
    // Save result to database
    await pool.query(
      `INSERT INTO post_results (post_id, channel_id, platform, platform_post_id, status, published_at, error_message, metadata)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)`,
      [
        post.id,
        channel.id,
        channel.platform,
        success ? (result?.postId || result?.videoId || result?.tweetId || result?.mediaId || result?.publishId || result?.pinId || result?.id) : null,
        success ? 'success' : 'failed',
        success ? null : error,
        success ? JSON.stringify({ url: result?.url || result?.permalink, post_type: post.post_type }) : null,
      ]
    );

    if (success) {
      hasSuccess = true;
      console.log(`[Scheduler] ✅ ${channel.platform} published successfully`);
    } else {
      hasFailure = true;
      console.log(`[Scheduler] ❌ ${channel.platform} failed: ${error}`);
    }
    
    results.push({ platform: channel.platform, success, result, error });
  }

  // Update post status
  let finalStatus = 'published';
  if (!hasSuccess) {
    finalStatus = 'failed';
  } else if (hasFailure) {
    finalStatus = 'partial'; // Some platforms succeeded, some failed
  }

  await pool.query(
    'UPDATE posts SET status = $1, published_at = NOW(), updated_at = NOW() WHERE id = $2',
    [finalStatus, post.id]
  );

  // Auto-cleanup media after successful scheduled post (5 minutes delay)
  if (hasSuccess) {
    MediaCleanupService.cleanupPostMedia(post.id, { delay: 30 * 60 * 1000 });
  }

  console.log(`[Scheduler] Post ${post.id} finished with status: ${finalStatus}`);
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
          console.log(`[Scheduler] Processing post ${post.id}...`);
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

    // Process scheduled posts every minute
    processScheduledPosts();
    intervalId = setInterval(processScheduledPosts, 60 * 1000);
    console.log('[Scheduler] Post scheduler started (checking every 60 seconds)');

    // Process token refresh every hour
    TokenRefreshService.processExpiringTokens();
    tokenRefreshIntervalId = setInterval(() => {
      TokenRefreshService.processExpiringTokens();
    }, 60 * 60 * 1000); // Every hour
    console.log(`[Scheduler] Token auto-refresh started (checking every hour, refreshing ${TokenRefreshService.REFRESH_DAYS_BEFORE} days before expiry)`);
  },

  stop(): void {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log('[Scheduler] Post scheduler stopped');
    }
    if (tokenRefreshIntervalId) {
      clearInterval(tokenRefreshIntervalId);
      tokenRefreshIntervalId = null;
      console.log('[Scheduler] Token auto-refresh stopped');
    }
  },

  // Manual trigger for token refresh
  async refreshExpiringTokens(): Promise<void> {
    await TokenRefreshService.processExpiringTokens();
  },
};
