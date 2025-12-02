import express from 'express';
import { pool } from '../lib/database';
import { FacebookService } from '../services/facebook';
import { InstagramService } from '../services/instagram';
import { YouTubeService } from '../services/youtube';
import { TikTokService } from '../services/tiktok';
import { TwitterService } from '../services/twitter';
import { TelegramService } from '../services/telegram';
import { LinkedInService } from '../services/linkedin';
import { MediaCleanupService } from '../services/media-cleanup';
import crypto from 'crypto';

const router = express.Router();

function decryptToken(encryptedToken: string): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generate a smart title for platforms that require it (YouTube, Pinterest)
 * Falls back to first line of content if no title provided
 */
function getSmartTitle(post: any, maxLength: number = 100): string {
  // Use provided title if available
  if (post.title && post.title.trim()) {
    return post.title.trim().substring(0, maxLength);
  }
  
  // Extract first line from content
  if (post.content) {
    const firstLine = post.content.split('\n')[0].trim();
    if (firstLine) {
      return firstLine.substring(0, maxLength);
    }
  }
  
  // Fallback to generic title
  return 'Untitled Post';
}

/**
 * POST /api/publish
 * Publish a post to selected platforms
 */
router.post('/', async (req: any, res) => {
  const { post_id } = req.body;
  const userId = req.user.id;

  try {
    const postResult = await pool.query(
      'SELECT * FROM posts WHERE id = $1 AND user_id = $2',
      [post_id, userId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];
    const platforms = post.platforms || [];
    const postType = post.post_type || 'text';
    const results: any[] = [];

    for (const platform of platforms) {
      try {
        if (platform === 'facebook') {
          const channelResult = await pool.query(
            'SELECT * FROM connected_channels WHERE user_id = $1 AND platform = $2 AND is_active = true LIMIT 1',
            [userId, 'facebook']
          );

          if (channelResult.rows.length === 0) {
            results.push({ platform: 'facebook', status: 'failed', error: 'No Facebook page connected' });
            continue;
          }

          const channel = channelResult.rows[0];
          const accessToken = decryptToken(channel.access_token);
          const pageId = channel.channel_id;

          let publishResult;

          // Publish based on post type
          switch (postType) {
            case 'reel':
              if (post.media_url && post.media_url.includes('/videos/')) {
                const filePath = post.media_url.replace('https://socialautoupload.com/uploads/', '/opt/social-symphony/uploads/');
                publishResult = await FacebookService.publishReel(accessToken, pageId, filePath, post.content);
              } else {
                throw new Error('Reel requires a video file');
              }
              break;

            case 'album':
              // Expect multiple media URLs in metadata
              const mediaUrls = post.metadata?.media_urls || [];
              if (mediaUrls.length > 0) {
                publishResult = await FacebookService.publishPhotoAlbum(accessToken, pageId, mediaUrls, post.content);
              } else {
                throw new Error('Album requires multiple photos');
              }
              break;

            case 'link':
              const linkUrl = post.metadata?.link_url || post.media_url;
              if (linkUrl) {
                publishResult = await FacebookService.publishLink(accessToken, pageId, linkUrl, post.content);
              } else {
                throw new Error('Link post requires a URL');
              }
              break;

            case 'video':
              if (post.media_url && post.media_url.includes('/videos/')) {
                const filePath = post.media_url.replace('https://socialautoupload.com/uploads/', '/opt/social-symphony/uploads/');
                publishResult = await FacebookService.publishVideoPost(accessToken, pageId, filePath, post.content);
              } else {
                throw new Error('Video post requires a video file');
              }
              break;

            case 'photo':
              if (post.media_url && post.media_url.includes('/images/')) {
                publishResult = await FacebookService.publishPhotoPost(accessToken, pageId, post.media_url, post.content);
              } else {
                throw new Error('Photo post requires an image');
              }
              break;

            case 'text':
            default:
              publishResult = await FacebookService.publishTextPost(accessToken, pageId, post.content);
              break;
          }

          await pool.query(
            `INSERT INTO post_results (post_id, channel_id, platform, platform_post_id, status, published_at, metadata)
             VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
            [
              post_id,
              channel.id,
              'facebook',
              (publishResult as any).postId || (publishResult as any).videoId || (publishResult as any).reelId || (publishResult as any).albumId,
              'success',
              JSON.stringify({ url: publishResult.url, post_type: postType }),
            ]
          );

          results.push({ platform: 'facebook', status: 'success', url: publishResult.url, post_type: postType });

        } else if (platform === 'instagram') {
          // Instagram Publishing
          const channelResult = await pool.query(
            'SELECT * FROM connected_channels WHERE user_id = $1 AND platform = $2 AND is_active = true LIMIT 1',
            [userId, 'instagram']
          );

          if (channelResult.rows.length === 0) {
            results.push({ platform: 'instagram', status: 'failed', error: 'No Instagram account connected' });
            continue;
          }

          const channel = channelResult.rows[0];
          const accessToken = decryptToken(channel.access_token);
          const pageId = channel.metadata?.facebook_page_id;
          
          if (!pageId) {
            results.push({ platform: 'instagram', status: 'failed', error: 'Facebook Page ID required for Instagram' });
            continue;
          }

          // Get Instagram Account ID
          const igAccountId = await InstagramService.getInstagramAccountId(accessToken, pageId);
          let publishResult;

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
                const coverUrl = post.metadata?.cover_url;
                publishResult = await InstagramService.publishReel(accessToken, igAccountId, post.media_url, post.content, coverUrl);
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

          await pool.query(
            `INSERT INTO post_results (post_id, channel_id, platform, platform_post_id, status, published_at, metadata)
             VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
            [
              post_id,
              channel.id,
              'instagram',
              publishResult.mediaId,
              'success',
              JSON.stringify({ 
                permalink: (publishResult as any).permalink || null, 
                post_type: postType 
              }),
            ]
          );

          results.push({ 
            platform: 'instagram', 
            status: 'success', 
            permalink: (publishResult as any).permalink, 
            post_type: postType 
          });

        } else if (platform === 'youtube') {
          // YouTube Publishing
          const channelResult = await pool.query(
            'SELECT * FROM connected_channels WHERE user_id = $1 AND platform = $2 AND is_active = true LIMIT 1',
            [userId, 'youtube']
          );

          if (channelResult.rows.length === 0) {
            results.push({ platform: 'youtube', status: 'failed', error: 'No YouTube channel connected' });
            continue;
          }

          const channel = channelResult.rows[0];
          const accessToken = decryptToken(channel.access_token);
          const refreshToken = channel.metadata?.refresh_token;
          
          if (!refreshToken) {
            results.push({ platform: 'youtube', status: 'failed', error: 'Refresh token required for YouTube' });
            continue;
          }

          let publishResult;

          switch (postType) {
            case 'video':
              if (post.media_url) {
                const filePath = post.media_url.replace('https://socialautoupload.com/uploads/', '/opt/social-symphony/uploads/');
                publishResult = await YouTubeService.uploadVideo(
                  accessToken,
                  filePath,
                  getSmartTitle(post, 100),  // ✅ Use smart title (max 100 chars)
                  post.content || '',        // ✅ Full content as description
                  post.metadata?.tags || [],
                  post.metadata?.category_id || '22',
                  post.metadata?.privacy || 'public'
                );
              } else {
                throw new Error('Video post requires a video file');
              }
              break;

            case 'short':
              if (post.media_url) {
                const filePath = post.media_url.replace('https://socialautoupload.com/uploads/', '/opt/social-symphony/uploads/');
                publishResult = await YouTubeService.uploadShort(
                  accessToken,
                  filePath,
                  getSmartTitle(post, 100),  // ✅ Use smart title (max 100 chars)
                  post.content || ''         // ✅ Full content as description
                );
              } else {
                throw new Error('Short requires a video file');
              }
              break;

            default:
              throw new Error(`Unsupported YouTube post type: ${postType}`);
          }

          await pool.query(
            `INSERT INTO post_results (post_id, channel_id, platform, platform_post_id, status, published_at, metadata)
             VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
            [
              post_id,
              channel.id,
              'youtube',
              publishResult.videoId,
              'success',
              JSON.stringify({ url: publishResult.url, post_type: postType }),
            ]
          );

          results.push({ platform: 'youtube', status: 'success', url: publishResult.url, post_type: postType });

        } else if (platform === 'tiktok') {
          // TikTok Publishing
          const channelResult = await pool.query(
            'SELECT * FROM connected_channels WHERE user_id = $1 AND platform = $2 AND is_active = true LIMIT 1',
            [userId, 'tiktok']
          );

          if (channelResult.rows.length === 0) {
            results.push({ platform: 'tiktok', status: 'failed', error: 'No TikTok account connected' });
            continue;
          }

          const channel = channelResult.rows[0];
          const accessToken = decryptToken(channel.access_token);

          if (postType === 'video' && post.media_url) {
            const filePath = post.media_url.replace('https://socialautoupload.com/uploads/', '/opt/social-symphony/uploads/');
            
            const publishResult = await TikTokService.uploadVideo(
              accessToken,
              filePath,
              post.content || '',
              post.metadata?.privacy_level || 'PUBLIC_TO_EVERYONE',
              {
                disableComment: post.metadata?.disable_comment === true,
                disableDuet: post.metadata?.disable_duet === true,
                disableStitch: post.metadata?.disable_stitch === true,
              }
            );

            await pool.query(
              `INSERT INTO post_results (post_id, channel_id, platform, platform_post_id, status, published_at, metadata)
               VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
              [
                post_id,
                channel.id,
                'tiktok',
                publishResult.publishId,
                'success',
                JSON.stringify({ post_type: postType }),
              ]
            );

            results.push({ platform: 'tiktok', status: 'success', publish_id: publishResult.publishId, post_type: postType });
          } else {
            throw new Error('TikTok only supports video posts');
          }

        } else if (platform === 'twitter') {
          // Twitter Publishing
          const channelResult = await pool.query(
            'SELECT * FROM connected_channels WHERE user_id = $1 AND platform = $2 AND is_active = true LIMIT 1',
            [userId, 'twitter']
          );

          if (channelResult.rows.length === 0) {
            results.push({ platform: 'twitter', status: 'failed', error: 'No Twitter account connected' });
            continue;
          }

          const channel = channelResult.rows[0];
          const accessToken = decryptToken(channel.access_token);
          const accessSecret = channel.metadata?.access_secret;

          if (!accessSecret) {
            results.push({ platform: 'twitter', status: 'failed', error: 'Access secret required for Twitter' });
            continue;
          }

          let publishResult;

          switch (postType) {
            case 'text':
              publishResult = await TwitterService.postTweet(accessToken, accessSecret, post.content);
              break;

            case 'media':
              if (post.media_url) {
                const mediaType = post.media_url.includes('/videos/') ? 'video' : 'photo';
                publishResult = await TwitterService.postTweetWithMedia(
                  accessToken,
                  accessSecret,
                  post.content,
                  post.media_url,
                  mediaType
                );
              } else {
                throw new Error('Media post requires a file');
              }
              break;

            case 'thread':
              const threadTexts = post.metadata?.thread_texts || [post.content];
              publishResult = await TwitterService.postThread(accessToken, accessSecret, threadTexts);
              break;

            default:
              throw new Error(`Unsupported Twitter post type: ${postType}`);
          }

          await pool.query(
            `INSERT INTO post_results (post_id, channel_id, platform, platform_post_id, status, published_at, metadata)
             VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
            [
              post_id,
              channel.id,
              'twitter',
              (publishResult as any).tweetId || (publishResult as any).threadId,
              'success',
              JSON.stringify({ url: publishResult.url, post_type: postType }),
            ]
          );

          results.push({ platform: 'twitter', status: 'success', url: publishResult.url, post_type: postType });

        } else if (platform === 'telegram') {
          // Telegram Publishing
          const channelResult = await pool.query(
            'SELECT * FROM connected_channels WHERE user_id = $1 AND platform = $2 AND is_active = true LIMIT 1',
            [userId, 'telegram']
          );

          if (channelResult.rows.length === 0) {
            results.push({ platform: 'telegram', status: 'failed', error: 'No Telegram channel connected' });
            continue;
          }

          const channel = channelResult.rows[0];
          const botToken = channel.access_token; // No decryption needed for bot token
          const chatId = channel.channel_id;

          let publishResult;

          switch (postType) {
            case 'text':
              publishResult = await TelegramService.sendMessage(botToken, chatId, post.content);
              break;

            case 'photo':
              if (post.media_url) {
                const filePath = post.media_url.replace('https://socialautoupload.com/uploads/', '/opt/social-symphony/uploads/');
                publishResult = await TelegramService.sendPhoto(botToken, chatId, filePath, post.content);
              } else {
                throw new Error('Photo post requires an image');
              }
              break;

            case 'video':
              if (post.media_url) {
                const filePath = post.media_url.replace('https://socialautoupload.com/uploads/', '/opt/social-symphony/uploads/');
                publishResult = await TelegramService.sendVideo(botToken, chatId, filePath, post.content);
              } else {
                throw new Error('Video post requires a video file');
              }
              break;

            case 'album':
              const albumMedia = post.metadata?.media_urls || [];
              if (albumMedia.length >= 2) {
                const mediaArray = albumMedia.map((url: string) => ({
                  type: url.includes('/videos/') ? 'video' : 'photo',
                  path: url.replace('https://socialautoupload.com/uploads/', '/opt/social-symphony/uploads/'),
                  caption: post.content || '',
                }));
                publishResult = await TelegramService.sendMediaGroup(botToken, chatId, mediaArray);
              } else {
                throw new Error('Album requires at least 2 media files');
              }
              break;

            default:
              // Default to text message
              publishResult = await TelegramService.sendMessage(botToken, chatId, post.content);
              break;
          }

          await pool.query(
            `INSERT INTO post_results (post_id, channel_id, platform, platform_post_id, status, published_at, metadata)
             VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
            [
              post_id,
              channel.id,
              'telegram',
              ((publishResult as any).messageId || (publishResult as any).messageIds?.[0])?.toString(),
              'success',
              JSON.stringify({ post_type: postType }),
            ]
          );

          results.push({ 
            platform: 'telegram', 
            status: 'success', 
            message_id: (publishResult as any).messageId || (publishResult as any).messageIds?.[0], 
            post_type: postType 
          });

        } else if (platform === 'linkedin') {
          // LinkedIn Publishing
          const channelResult = await pool.query(
            'SELECT * FROM connected_channels WHERE user_id = $1 AND platform = $2 AND is_active = true LIMIT 1',
            [userId, 'linkedin']
          );

          if (channelResult.rows.length === 0) {
            results.push({ platform: 'linkedin', status: 'failed', error: 'No LinkedIn account connected' });
            continue;
          }

          const channel = channelResult.rows[0];
          const accessToken = decryptToken(channel.access_token);
          const authorUrn = channel.metadata?.author_urn || `urn:li:person:${channel.channel_id}`;

          let publishResult;

          switch (postType) {
            case 'post':
              publishResult = await LinkedInService.postToProfile(
                accessToken,
                channel.channel_id,
                post.content,
                post.metadata?.visibility || 'PUBLIC'
              );
              break;

            case 'image':
              if (post.media_url) {
                publishResult = await LinkedInService.postWithImage(
                  accessToken,
                  authorUrn,
                  post.content,
                  post.media_url,
                  post.metadata?.visibility || 'PUBLIC'
                );
              } else {
                throw new Error('Image post requires an image');
              }
              break;

            case 'video':
              if (post.media_url) {
                publishResult = await LinkedInService.postWithVideo(
                  accessToken,
                  authorUrn,
                  post.content,
                  post.media_url,
                  post.metadata?.visibility || 'PUBLIC'
                );
              } else {
                throw new Error('Video post requires a video file');
              }
              break;

            case 'article':
              const articleUrl = post.metadata?.article_url;
              if (articleUrl) {
                publishResult = await LinkedInService.postArticle(
                  accessToken,
                  authorUrn,
                  post.metadata?.article_title || 'Article',
                  post.content,
                  articleUrl,
                  post.metadata?.visibility || 'PUBLIC'
                );
              } else {
                throw new Error('Article post requires an article URL');
              }
              break;

            default:
              throw new Error(`Unsupported LinkedIn post type: ${postType}`);
          }

          await pool.query(
            `INSERT INTO post_results (post_id, channel_id, platform, platform_post_id, status, published_at, metadata)
             VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
            [
              post_id,
              channel.id,
              'linkedin',
              publishResult.id,
              'success',
              JSON.stringify({ activity_urn: publishResult.activityUrn, post_type: postType }),
            ]
          );

          results.push({ platform: 'linkedin', status: 'success', activity_urn: publishResult.activityUrn, post_type: postType });

        }

      } catch (error: any) {
        const channelResult = await pool.query(
          'SELECT id FROM connected_channels WHERE user_id = $1 AND platform = $2 LIMIT 1',
          [userId, platform]
        );

        if (channelResult.rows.length > 0) {
          await pool.query(
            `INSERT INTO post_results (post_id, channel_id, platform, status, error_message)
             VALUES ($1, $2, $3, $4, $5)`,
            [post_id, channelResult.rows[0].id, platform, 'failed', error.message]
          );
        }

        results.push({ platform, status: 'failed', error: error.message });
      }
    }

    const allSuccess = results.every(r => r.status === 'success');
    const anySuccess = results.some(r => r.status === 'success');
    const newStatus = allSuccess ? 'published' : anySuccess ? 'published' : 'failed';

    await pool.query(
      'UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2',
      [newStatus, post_id]
    );

    // ✅ Auto-cleanup media after successful publish (5 minutes delay)
    if (anySuccess) {
      MediaCleanupService.cleanupPostMedia(post_id, { delay: 5 * 60 * 1000 });
    }

    res.json({ success: anySuccess, results, post_status: newStatus });

  } catch (error: any) {
    console.error('Publish error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/publish/results/:post_id
 */
router.get('/results/:post_id', async (req: any, res) => {
  const { post_id } = req.params;
  const userId = req.user.id;

  try {
    const postResult = await pool.query(
      'SELECT id FROM posts WHERE id = $1 AND user_id = $2',
      [post_id, userId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const results = await pool.query(
      `SELECT pr.*, cc.channel_name 
       FROM post_results pr
       LEFT JOIN connected_channels cc ON pr.channel_id = cc.id
       WHERE pr.post_id = $1
       ORDER BY pr.published_at DESC`,
      [post_id]
    );

    res.json({ results: results.rows });

  } catch (error: any) {
    console.error('Get results error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/publish/post-types
 * Get available post types for each platform
 */
router.get('/post-types', async (req: any, res) => {
  try {
    const postTypes = {
      facebook: [
        { type: 'text', label: 'Text Post', icon: '📝', description: 'Simple text post' },
        { type: 'photo', label: 'Photo', icon: '📷', description: 'Single photo post' },
        { type: 'video', label: 'Video', icon: '🎥', description: 'Video post (up to 4 hours)' },
        { type: 'reel', label: 'Reel', icon: '🎬', description: 'Short vertical video (3-90s)' },
        { type: 'album', label: 'Photo Album', icon: '🖼️', description: 'Multiple photos' },
        { type: 'link', label: 'Link Post', icon: '🔗', description: 'Share a link with preview' },
      ],
      youtube: [
        { type: 'video', label: 'Video', icon: '🎥', description: 'Regular YouTube video' },
        { type: 'short', label: 'Short', icon: '⚡', description: 'YouTube Shorts (vertical, <60s)' },
      ],
      tiktok: [
        { type: 'video', label: 'Video', icon: '🎵', description: 'TikTok video (up to 10min)' },
      ],
      instagram: [
        { type: 'photo', label: 'Photo', icon: '📷', description: 'Single photo or carousel' },
        { type: 'reel', label: 'Reel', icon: '🎬', description: 'Instagram Reel' },
        { type: 'story', label: 'Story', icon: '⭕', description: '24-hour story' },
      ],
    };

    res.json({ post_types: postTypes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
