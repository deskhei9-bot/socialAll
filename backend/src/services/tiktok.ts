import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * TikTok Content Posting API Service
 */
export class TikTokService {
  private static readonly API_BASE = 'https://open.tiktokapis.com/v2';

  /**
   * Initialize video upload
   */
  static async initializeUpload(
    accessToken: string
  ): Promise<{ upload_id: string; upload_url: string }> {
    try {
      const response = await axios.post(
        `${this.API_BASE}/post/publish/video/init/`,
        {
          post_info: {
            title: '',
            privacy_level: 'SELF_ONLY', // Will update after upload
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: 0, // Will be set during chunk upload
            chunk_size: 10000000, // 10MB chunks
            total_chunk_count: 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        upload_id: response.data.data.upload_id,
        upload_url: response.data.data.upload_url,
      };
    } catch (error: any) {
      throw new Error(`TikTok Init Upload Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Upload video to TikTok
   */
  static async uploadVideo(
    accessToken: string,
    videoPath: string,
    title: string,
    privacy: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY' = 'PUBLIC_TO_EVERYONE',
    options: {
      disableComment?: boolean;
      disableDuet?: boolean;
      disableStitch?: boolean;
    } = {}
  ): Promise<{ publishId: string }> {
    try {
      // Step 1: Initialize upload
      const stats = fs.statSync(videoPath);
      const fileSize = stats.size;

      const response = await axios.post(
        `${this.API_BASE}/post/publish/video/init/`,
        {
          post_info: {
            title,
            privacy_level: privacy,
            disable_comment: options.disableComment || false,
            disable_duet: options.disableDuet || false,
            disable_stitch: options.disableStitch || false,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: fileSize,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const uploadUrl = response.data.data.upload_url;
      const publishId = response.data.data.publish_id;

      // Step 2: Upload video file
      const formData = new FormData();
      formData.append('video', fs.createReadStream(videoPath));

      await axios.put(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': fileSize,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      return { publishId };
    } catch (error: any) {
      throw new Error(`TikTok Upload Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Check video upload status
   */
  static async checkUploadStatus(
    accessToken: string,
    publishId: string
  ): Promise<{
    status: 'PROCESSING_UPLOAD' | 'SEND_TO_USER_INBOX' | 'PUBLISH_COMPLETE' | 'FAILED';
    failReason?: string;
  }> {
    try {
      const response = await axios.post(
        `${this.API_BASE}/post/publish/status/fetch/`,
        {
          publish_id: publishId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        status: response.data.data.status,
        failReason: response.data.data.fail_reason,
      };
    } catch (error: any) {
      throw new Error(`TikTok Status Check Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get user info
   */
  static async getUserInfo(
    accessToken: string
  ): Promise<{
    openId: string;
    unionId: string;
    displayName: string;
    avatarUrl: string;
  }> {
    try {
      const response = await axios.get(
        `${this.API_BASE}/user/info/`,
        {
          params: {
            fields: 'open_id,union_id,display_name,avatar_url',
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data.data.user;

      return {
        openId: data.open_id,
        unionId: data.union_id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
      };
    } catch (error: any) {
      throw new Error(`TikTok User Info Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get video analytics
   */
  static async getVideoAnalytics(
    accessToken: string,
    videoIds: string[]
  ): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.API_BASE}/video/query/`,
        {
          filters: {
            video_ids: videoIds,
          },
          fields: [
            'id',
            'create_time',
            'cover_image_url',
            'share_url',
            'video_description',
            'duration',
            'height',
            'width',
            'title',
            'embed_html',
            'embed_link',
            'like_count',
            'comment_count',
            'share_count',
            'view_count',
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data.videos;
    } catch (error: any) {
      throw new Error(`TikTok Analytics Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}
