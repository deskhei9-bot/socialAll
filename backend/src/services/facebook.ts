import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export class FacebookService {
  /**
   * Get user's Facebook pages
   */
  static async getUserPages(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        'https://graph.facebook.com/v18.0/me/accounts',
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,access_token,category,picture',
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Facebook API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get page access token from user access token
   */
  static async getPageAccessToken(userAccessToken: string, pageId: string): Promise<string> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${pageId}`,
        {
          params: {
            fields: 'access_token',
            access_token: userAccessToken,
          },
        }
      );
      return response.data.access_token;
    } catch (error: any) {
      throw new Error(`Facebook API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish a text post
   */
  static async publishTextPost(
    accessToken: string,
    pageId: string,
    message: string
  ): Promise<{ postId: string; url: string }> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          message,
          access_token: accessToken,
        }
      );

      return {
        postId: response.data.id,
        url: `https://facebook.com/${response.data.id}`,
      };
    } catch (error: any) {
      throw new Error(`Facebook API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish a photo post
   */
  static async publishPhotoPost(
    accessToken: string,
    pageId: string,
    photoUrl: string,
    message: string
  ): Promise<{ postId: string; url: string }> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/photos`,
        {
          url: photoUrl,
          message,
          access_token: accessToken,
        }
      );

      return {
        postId: response.data.id,
        url: `https://facebook.com/${response.data.id}`,
      };
    } catch (error: any) {
      throw new Error(`Facebook Photo Upload Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish a video post
   */
  static async publishVideoPost(
    accessToken: string,
    pageId: string,
    videoPath: string,
    description: string
  ): Promise<{ videoId: string; url: string }> {
    try {
      const stats = fs.statSync(videoPath);
      const fileSize = stats.size;

      // For videos larger than 10MB, use chunked upload
      if (fileSize > 10 * 1024 * 1024) {
        return await this.publishVideoChunked(accessToken, pageId, videoPath, description);
      }

      // For smaller videos, use direct upload
      const formData = new FormData();
      formData.append('description', description);
      formData.append('source', fs.createReadStream(videoPath));

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/videos`,
        formData,
        {
          params: { access_token: accessToken },
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      return {
        videoId: response.data.id,
        url: `https://facebook.com/${response.data.id}`,
      };
    } catch (error: any) {
      throw new Error(`Facebook Video Upload Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Upload video using chunked upload (for large files)
   */
  private static async publishVideoChunked(
    accessToken: string,
    pageId: string,
    videoPath: string,
    description: string
  ): Promise<{ videoId: string; url: string }> {
    try {
      const stats = fs.statSync(videoPath);
      const fileSize = stats.size;

      // Step 1: Initialize upload session
      const initResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/videos`,
        {
          upload_phase: 'start',
          file_size: fileSize,
          access_token: accessToken,
        }
      );

      const uploadSessionId = initResponse.data.upload_session_id;
      const chunkSize = 10 * 1024 * 1024; // 10MB chunks
      let start = 0;

      // Step 2: Upload chunks
      while (start < fileSize) {
        const end = Math.min(start + chunkSize, fileSize);
        const chunk = fs.createReadStream(videoPath, { start, end: end - 1 });

        const formData = new FormData();
        formData.append('upload_phase', 'transfer');
        formData.append('upload_session_id', uploadSessionId);
        formData.append('start_offset', start.toString());
        formData.append('video_file_chunk', chunk);

        await axios.post(
          `https://graph.facebook.com/v18.0/${pageId}/videos`,
          formData,
          {
            params: { access_token: accessToken },
            headers: formData.getHeaders(),
          }
        );

        start = end;
      }

      // Step 3: Finalize upload
      const finalResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/videos`,
        {
          upload_phase: 'finish',
          upload_session_id: uploadSessionId,
          description,
          access_token: accessToken,
        }
      );

      return {
        videoId: finalResponse.data.id,
        url: `https://facebook.com/${finalResponse.data.id}`,
      };
    } catch (error: any) {
      throw new Error(`Facebook Chunked Upload Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish a Facebook Reel (short vertical video, 3-90 seconds)
   */
  static async publishReel(
    accessToken: string,
    pageId: string,
    videoPath: string,
    description: string
  ): Promise<{ reelId: string; url: string }> {
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('upload_phase', 'start');
      formData.append('video_file', fs.createReadStream(videoPath));

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/video_reels`,
        formData,
        {
          params: { access_token: accessToken },
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      return {
        reelId: response.data.id,
        url: `https://facebook.com/reel/${response.data.id}`,
      };
    } catch (error: any) {
      throw new Error(`Facebook Reel Upload Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish multiple photos as an album
   */
  static async publishPhotoAlbum(
    accessToken: string,
    pageId: string,
    photoUrls: string[],
    message: string
  ): Promise<{ albumId: string; url: string }> {
    try {
      // Step 1: Create album
      const albumResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/albums`,
        {
          name: message.substring(0, 100) || 'Photo Album',
          message: message,
          access_token: accessToken,
        }
      );

      const albumId = albumResponse.data.id;

      // Step 2: Upload photos to album
      for (const photoUrl of photoUrls) {
        await axios.post(
          `https://graph.facebook.com/v18.0/${albumId}/photos`,
          {
            url: photoUrl,
            access_token: accessToken,
          }
        );
      }

      return {
        albumId,
        url: `https://facebook.com/${albumId}`,
      };
    } catch (error: any) {
      throw new Error(`Facebook Album Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish a link with preview
   */
  static async publishLink(
    accessToken: string,
    pageId: string,
    link: string,
    message: string
  ): Promise<{ postId: string; url: string }> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          link,
          message,
          access_token: accessToken,
        }
      );

      return {
        postId: response.data.id,
        url: `https://facebook.com/${response.data.id}`,
      };
    } catch (error: any) {
      throw new Error(`Facebook Link Post Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}
