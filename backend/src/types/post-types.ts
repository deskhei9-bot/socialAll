/**
 * Post Types for Different Platforms
 */

// Facebook Post Types
export enum FacebookPostType {
  TEXT = 'text',
  PHOTO = 'photo',
  ALBUM = 'album',
  VIDEO = 'video',
  REEL = 'reel',
  STORY = 'story',
  LINK = 'link',
}

// YouTube Post Types
export enum YouTubePostType {
  VIDEO = 'video',
  SHORT = 'short',
  LIVE = 'live',
  PREMIERE = 'premiere',
}

// TikTok Post Types
export enum TikTokPostType {
  VIDEO = 'video',
  PHOTO = 'photo',
}

// Instagram Post Types
export enum InstagramPostType {
  PHOTO = 'photo',
  CAROUSEL = 'carousel',
  VIDEO = 'video',
  REEL = 'reel',
  STORY = 'story',
}

// Twitter Post Types
export enum TwitterPostType {
  TEXT = 'text',
  MEDIA = 'media',
  THREAD = 'thread',
  POLL = 'poll',
}

// Telegram Post Types
export enum TelegramPostType {
  MESSAGE = 'message',
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT = 'document',
  ALBUM = 'album',
}

// LinkedIn Post Types
export enum LinkedInPostType {
  POST = 'post',
  ARTICLE = 'article',
  IMAGE = 'image',
  VIDEO = 'video',
}

// Platform Post Type Configuration
export interface PlatformPostTypeConfig {
  platform: string;
  postType: string;
  requirements: {
    minDuration?: number;
    maxDuration?: number;
    aspectRatio?: string[];
    maxFileSize?: number;
    allowedFormats?: string[];
    maxCharacters?: number;
    hashtagLimit?: number;
  };
  features?: {
    supportsScheduling?: boolean;
    supportsHashtags?: boolean;
    supportsMentions?: boolean;
    supportsLocation?: boolean;
    supportsMultipleFiles?: boolean;
  };
}

// Platform Configurations
export const PLATFORM_CONFIGS: Record<string, PlatformPostTypeConfig[]> = {
  facebook: [
    {
      platform: 'facebook',
      postType: 'text',
      requirements: { maxCharacters: 63206 },
      features: { supportsScheduling: true, supportsHashtags: true },
    },
    {
      platform: 'facebook',
      postType: 'photo',
      requirements: { maxFileSize: 500, allowedFormats: ['jpg', 'png', 'gif'] },
      features: { supportsScheduling: true },
    },
    {
      platform: 'facebook',
      postType: 'video',
      requirements: { maxDuration: 14400, maxFileSize: 500 },
      features: { supportsScheduling: true },
    },
    {
      platform: 'facebook',
      postType: 'reel',
      requirements: { minDuration: 3, maxDuration: 90, aspectRatio: ['9:16'] },
      features: { supportsHashtags: true },
    },
  ],
  youtube: [
    {
      platform: 'youtube',
      postType: 'video',
      requirements: { maxDuration: 43200, maxFileSize: 500 },
      features: { supportsScheduling: true },
    },
    {
      platform: 'youtube',
      postType: 'short',
      requirements: { maxDuration: 60, aspectRatio: ['9:16'] },
      features: { supportsScheduling: true },
    },
  ],
  tiktok: [
    {
      platform: 'tiktok',
      postType: 'video',
      requirements: { maxDuration: 600, aspectRatio: ['9:16'] },
      features: { supportsScheduling: true, supportsHashtags: true },
    },
  ],
  instagram: [
    {
      platform: 'instagram',
      postType: 'photo',
      requirements: { aspectRatio: ['1:1', '4:5', '1.91:1'], maxFileSize: 500, allowedFormats: ['jpg', 'png'] },
      features: { supportsScheduling: true, supportsHashtags: true, supportsLocation: true },
    },
    {
      platform: 'instagram',
      postType: 'carousel',
      requirements: { aspectRatio: ['1:1', '4:5'], maxFileSize: 500, allowedFormats: ['jpg', 'png'] },
      features: { supportsScheduling: true, supportsHashtags: true, supportsMultipleFiles: true },
    },
    {
      platform: 'instagram',
      postType: 'video',
      requirements: { maxDuration: 3600, aspectRatio: ['1:1', '4:5', '16:9'], maxFileSize: 500 },
      features: { supportsScheduling: true, supportsHashtags: true },
    },
    {
      platform: 'instagram',
      postType: 'reel',
      requirements: { minDuration: 3, maxDuration: 90, aspectRatio: ['9:16'], maxFileSize: 500 },
      features: { supportsScheduling: true, supportsHashtags: true },
    },
    {
      platform: 'instagram',
      postType: 'story',
      requirements: { maxDuration: 60, aspectRatio: ['9:16'], maxFileSize: 500 },
      features: { supportsHashtags: true, supportsLocation: true },
    },
  ],
  twitter: [
    {
      platform: 'twitter',
      postType: 'text',
      requirements: { maxCharacters: 280 },
      features: { supportsScheduling: true, supportsHashtags: true, supportsMentions: true },
    },
    {
      platform: 'twitter',
      postType: 'media',
      requirements: { maxFileSize: 512, allowedFormats: ['jpg', 'png', 'gif', 'mp4'] },
      features: { supportsScheduling: true, supportsHashtags: true, supportsMultipleFiles: true },
    },
    {
      platform: 'twitter',
      postType: 'thread',
      requirements: { maxCharacters: 280 },
      features: { supportsScheduling: true, supportsHashtags: true, supportsMentions: true },
    },
  ],
  telegram: [
    {
      platform: 'telegram',
      postType: 'message',
      requirements: { maxCharacters: 4096 },
      features: { supportsScheduling: true, supportsHashtags: true, supportsMentions: true },
    },
    {
      platform: 'telegram',
      postType: 'photo',
      requirements: { maxFileSize: 500, allowedFormats: ['jpg', 'png'] },
      features: { supportsScheduling: true },
    },
    {
      platform: 'telegram',
      postType: 'video',
      requirements: { maxFileSize: 2048, allowedFormats: ['mp4'] },
      features: { supportsScheduling: true },
    },
    {
      platform: 'telegram',
      postType: 'document',
      requirements: { maxFileSize: 2048 },
      features: { supportsScheduling: true },
    },
    {
      platform: 'telegram',
      postType: 'album',
      requirements: { maxFileSize: 500 },
      features: { supportsScheduling: true, supportsMultipleFiles: true },
    },
  ],
  linkedin: [
    {
      platform: 'linkedin',
      postType: 'post',
      requirements: { maxCharacters: 3000 },
      features: { supportsScheduling: true, supportsHashtags: true, supportsMentions: true },
    },
    {
      platform: 'linkedin',
      postType: 'article',
      requirements: { maxCharacters: 125000 },
      features: { supportsScheduling: true },
    },
    {
      platform: 'linkedin',
      postType: 'image',
      requirements: { maxFileSize: 500, allowedFormats: ['jpg', 'png'] },
      features: { supportsScheduling: true, supportsHashtags: true },
    },
    {
      platform: 'linkedin',
      postType: 'video',
      requirements: { maxDuration: 600, maxFileSize: 500, allowedFormats: ['mp4'] },
      features: { supportsScheduling: true, supportsHashtags: true },
    },
  ],
};

export function getPostTypeConfig(platform: string, postType: string): PlatformPostTypeConfig | undefined {
  const configs = PLATFORM_CONFIGS[platform.toLowerCase()];
  return configs?.find(c => c.postType === postType);
}
