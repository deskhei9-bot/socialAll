import { google, youtube_v3 } from 'googleapis';
import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';

/**
 * YouTube Data API v3 Service
 */
export class YouTubeService {
  /**
   * Create OAuth2 client
   */
  private static getOAuth2Client(accessToken: string): OAuth2Client {
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    return oauth2Client;
  }

  /**
   * Upload a video to YouTube
   */
  static async uploadVideo(
    accessToken: string,
    videoPath: string,
    title: string,
    description: string,
    tags: string[] = [],
    categoryId: string = '22', // People & Blogs
    privacyStatus: 'public' | 'private' | 'unlisted' = 'public'
  ): Promise<{ videoId: string; url: string }> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId,
          },
          status: {
            privacyStatus,
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      });

      const videoId = response.data.id!;

      return {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    } catch (error: any) {
      throw new Error(`YouTube Upload Error: ${error.message}`);
    }
  }

  /**
   * Upload a YouTube Short (vertical video < 60s)
   */
  static async uploadShort(
    accessToken: string,
    videoPath: string,
    title: string,
    description: string,
    tags: string[] = []
  ): Promise<{ videoId: string; url: string }> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      // Add #Shorts to description for YouTube to recognize it as a Short
      const shortDescription = description + '\n\n#Shorts';

      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description: shortDescription,
            tags: [...tags, 'Shorts'],
            categoryId: '22',
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      });

      const videoId = response.data.id!;

      return {
        videoId,
        url: `https://www.youtube.com/shorts/${videoId}`,
      };
    } catch (error: any) {
      throw new Error(`YouTube Short Upload Error: ${error.message}`);
    }
  }

  /**
   * Upload video thumbnail
   */
  static async uploadThumbnail(
    accessToken: string,
    videoId: string,
    thumbnailPath: string
  ): Promise<void> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      await youtube.thumbnails.set({
        videoId,
        media: {
          body: fs.createReadStream(thumbnailPath),
        },
      });
    } catch (error: any) {
      throw new Error(`Thumbnail Upload Error: ${error.message}`);
    }
  }

  /**
   * Update video metadata
   */
  static async updateVideo(
    accessToken: string,
    videoId: string,
    updates: {
      title?: string;
      description?: string;
      tags?: string[];
      categoryId?: string;
      privacyStatus?: 'public' | 'private' | 'unlisted';
    }
  ): Promise<void> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      // Get current video data
      const videoResponse = await youtube.videos.list({
        part: ['snippet', 'status'],
        id: [videoId],
      });

      if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = videoResponse.data.items[0];
      const snippet = video.snippet!;
      const status = video.status!;

      // Update video
      await youtube.videos.update({
        part: ['snippet', 'status'],
        requestBody: {
          id: videoId,
          snippet: {
            title: updates.title || snippet.title,
            description: updates.description || snippet.description,
            tags: updates.tags || snippet.tags,
            categoryId: updates.categoryId || snippet.categoryId,
          },
          status: {
            privacyStatus: updates.privacyStatus || status.privacyStatus,
            selfDeclaredMadeForKids: status.selfDeclaredMadeForKids,
          },
        },
      });
    } catch (error: any) {
      throw new Error(`Update Video Error: ${error.message}`);
    }
  }

  /**
   * Delete a video
   */
  static async deleteVideo(
    accessToken: string,
    videoId: string
  ): Promise<void> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      await youtube.videos.delete({
        id: videoId,
      });
    } catch (error: any) {
      throw new Error(`Delete Video Error: ${error.message}`);
    }
  }

  /**
   * Get channel information
   */
  static async getChannel(
    accessToken: string
  ): Promise<{
    id: string;
    title: string;
    description: string;
    customUrl: string;
    subscriberCount: string;
  }> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      const response = await youtube.channels.list({
        part: ['snippet', 'statistics'],
        mine: true,
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('No channel found');
      }

      const channel = response.data.items[0];

      return {
        id: channel.id!,
        title: channel.snippet!.title!,
        description: channel.snippet!.description || '',
        customUrl: channel.snippet!.customUrl || '',
        subscriberCount: channel.statistics!.subscriberCount || '0',
      };
    } catch (error: any) {
      throw new Error(`Get Channel Error: ${error.message}`);
    }
  }

  /**
   * Get video analytics
   */
  static async getVideoAnalytics(
    accessToken: string,
    videoId: string
  ): Promise<{
    views: string;
    likes: string;
    comments: string;
    shares?: string;
  }> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      const response = await youtube.videos.list({
        part: ['statistics'],
        id: [videoId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const stats = response.data.items[0].statistics!;

      return {
        views: stats.viewCount || '0',
        likes: stats.likeCount || '0',
        comments: stats.commentCount || '0',
      };
    } catch (error: any) {
      throw new Error(`Get Analytics Error: ${error.message}`);
    }
  }

  /**
   * Get channel analytics (summary)
   */
  static async getChannelAnalytics(
    accessToken: string,
    startDate: string, // YYYY-MM-DD
    endDate: string     // YYYY-MM-DD
  ): Promise<{
    views: number;
    estimatedMinutesWatched: number;
    averageViewDuration: number;
    subscribersGained: number;
  }> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });

      // Get channel ID first
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
      const channelResponse = await youtube.channels.list({
        part: ['id'],
        mine: true,
      });

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        throw new Error('No channel found');
      }

      const channelId = channelResponse.data.items[0].id!;

      // Get analytics
      const response = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained',
      });

      const rows = response.data.rows;
      if (!rows || rows.length === 0) {
        return {
          views: 0,
          estimatedMinutesWatched: 0,
          averageViewDuration: 0,
          subscribersGained: 0,
        };
      }

      const data = rows[0];

      return {
        views: Number(data[0]) || 0,
        estimatedMinutesWatched: Number(data[1]) || 0,
        averageViewDuration: Number(data[2]) || 0,
        subscribersGained: Number(data[3]) || 0,
      };
    } catch (error: any) {
      throw new Error(`Get Channel Analytics Error: ${error.message}`);
    }
  }

  /**
   * Create a playlist
   */
  static async createPlaylist(
    accessToken: string,
    title: string,
    description: string,
    privacyStatus: 'public' | 'private' | 'unlisted' = 'public'
  ): Promise<{ playlistId: string }> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      const response = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
          },
          status: {
            privacyStatus,
          },
        },
      });

      return {
        playlistId: response.data.id!,
      };
    } catch (error: any) {
      throw new Error(`Create Playlist Error: ${error.message}`);
    }
  }

  /**
   * Add video to playlist
   */
  static async addVideoToPlaylist(
    accessToken: string,
    playlistId: string,
    videoId: string
  ): Promise<void> {
    try {
      const oauth2Client = this.getOAuth2Client(accessToken);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      await youtube.playlistItems.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId,
            },
          },
        },
      });
    } catch (error: any) {
      throw new Error(`Add to Playlist Error: ${error.message}`);
    }
  }
}
