import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Instagram Graph API Service
 * Uses Facebook Graph API for Instagram Business accounts
 */
export class InstagramService {
  /**
   * Get Instagram business account ID from Facebook page
   */
  static async getInstagramAccountId(
    accessToken: string,
    facebookPageId: string
  ): Promise<string> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${facebookPageId}`,
        {
          params: {
            fields: 'instagram_business_account',
            access_token: accessToken,
          },
        }
      );

      if (!response.data.instagram_business_account) {
        throw new Error('No Instagram Business Account linked to this Facebook Page');
      }

      return response.data.instagram_business_account.id;
    } catch (error: any) {
      throw new Error(`Instagram Account Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish a photo to Instagram
   * Two-step process: 1) Create container, 2) Publish container
   */
  static async publishPhoto(
    accessToken: string,
    instagramAccountId: string,
    imageUrl: string,
    caption: string
  ): Promise<{ mediaId: string; permalink: string }> {
    try {
      // Step 1: Create media container
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        }
      );

      const containerId = containerResponse.data.id;

      // Wait for container to be ready
      await this.waitForContainerReady(accessToken, containerId);

      // Step 2: Publish the container
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: accessToken,
        }
      );

      const mediaId = publishResponse.data.id;

      // Get permalink
      const permalinkResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          params: {
            fields: 'permalink',
            access_token: accessToken,
          },
        }
      );

      return {
        mediaId,
        permalink: permalinkResponse.data.permalink,
      };
    } catch (error: any) {
      throw new Error(`Instagram Photo Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish a carousel (multiple photos) to Instagram
   */
  static async publishCarousel(
    accessToken: string,
    instagramAccountId: string,
    imageUrls: string[],
    caption: string
  ): Promise<{ mediaId: string; permalink: string }> {
    try {
      // Step 1: Create media containers for each image
      const containerIds: string[] = [];

      for (const imageUrl of imageUrls) {
        const response = await axios.post(
          `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
          {
            image_url: imageUrl,
            is_carousel_item: true,
            access_token: accessToken,
          }
        );
        containerIds.push(response.data.id);
      }

      // Wait for all containers to be ready
      for (const containerId of containerIds) {
        await this.waitForContainerReady(accessToken, containerId);
      }

      // Step 2: Create carousel container
      const carouselResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          media_type: 'CAROUSEL',
          children: containerIds.join(','),
          caption,
          access_token: accessToken,
        }
      );

      const carouselId = carouselResponse.data.id;

      // Wait for carousel container to be ready
      await this.waitForContainerReady(accessToken, carouselId);

      // Step 3: Publish the carousel
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          creation_id: carouselId,
          access_token: accessToken,
        }
      );

      const mediaId = publishResponse.data.id;

      // Get permalink
      const permalinkResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          params: {
            fields: 'permalink',
            access_token: accessToken,
          },
        }
      );

      return {
        mediaId,
        permalink: permalinkResponse.data.permalink,
      };
    } catch (error: any) {
      throw new Error(`Instagram Carousel Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish a video to Instagram (standard video post)
   */
  static async publishVideo(
    accessToken: string,
    instagramAccountId: string,
    videoUrl: string,
    caption: string,
    coverUrl?: string
  ): Promise<{ mediaId: string; permalink: string }> {
    try {
      // Step 1: Create video container
      const containerData: any = {
        media_type: 'VIDEO',
        video_url: videoUrl,
        caption,
        access_token: accessToken,
      };

      if (coverUrl) {
        containerData.thumb_offset = 0; // Use first frame as thumbnail
      }

      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        containerData
      );

      const containerId = containerResponse.data.id;

      // Wait for video to be processed (can take longer)
      await this.waitForContainerReady(accessToken, containerId, 120000); // 2 minutes timeout

      // Step 2: Publish the container
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: accessToken,
        }
      );

      const mediaId = publishResponse.data.id;

      // Get permalink
      const permalinkResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          params: {
            fields: 'permalink',
            access_token: accessToken,
          },
        }
      );

      return {
        mediaId,
        permalink: permalinkResponse.data.permalink,
      };
    } catch (error: any) {
      throw new Error(`Instagram Video Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish an Instagram Reel
   */
  static async publishReel(
    accessToken: string,
    instagramAccountId: string,
    videoUrl: string,
    caption: string,
    coverUrl?: string
  ): Promise<{ mediaId: string; permalink: string }> {
    try {
      // Step 1: Create Reel container
      const containerData: any = {
        media_type: 'REELS',
        video_url: videoUrl,
        caption,
        share_to_feed: true, // Also share to main feed
        access_token: accessToken,
      };

      if (coverUrl) {
        containerData.cover_url = coverUrl;
      }

      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        containerData
      );

      const containerId = containerResponse.data.id;

      // Wait for reel to be processed
      await this.waitForContainerReady(accessToken, containerId, 180000); // 3 minutes timeout

      // Step 2: Publish the reel
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: accessToken,
        }
      );

      const mediaId = publishResponse.data.id;

      // Get permalink
      const permalinkResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          params: {
            fields: 'permalink',
            access_token: accessToken,
          },
        }
      );

      return {
        mediaId,
        permalink: permalinkResponse.data.permalink,
      };
    } catch (error: any) {
      throw new Error(`Instagram Reel Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Publish a Story to Instagram
   */
  static async publishStory(
    accessToken: string,
    instagramAccountId: string,
    mediaUrl: string,
    mediaType: 'IMAGE' | 'VIDEO'
  ): Promise<{ mediaId: string }> {
    try {
      const containerData: any = {
        media_type: 'STORIES',
        access_token: accessToken,
      };

      if (mediaType === 'IMAGE') {
        containerData.image_url = mediaUrl;
      } else {
        containerData.video_url = mediaUrl;
      }

      // Step 1: Create story container
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        containerData
      );

      const containerId = containerResponse.data.id;

      // Wait for container to be ready
      await this.waitForContainerReady(accessToken, containerId, 60000);

      // Step 2: Publish the story
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: accessToken,
        }
      );

      return {
        mediaId: publishResponse.data.id,
      };
    } catch (error: any) {
      throw new Error(`Instagram Story Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Wait for media container to be ready for publishing
   */
  private static async waitForContainerReady(
    accessToken: string,
    containerId: string,
    timeout: number = 60000
  ): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 2000; // Check every 2 seconds

    while (Date.now() - startTime < timeout) {
      try {
        const response = await axios.get(
          `https://graph.facebook.com/v18.0/${containerId}`,
          {
            params: {
              fields: 'status_code',
              access_token: accessToken,
            },
          }
        );

        const statusCode = response.data.status_code;

        if (statusCode === 'FINISHED') {
          return; // Ready to publish
        } else if (statusCode === 'ERROR') {
          throw new Error('Media container processing failed');
        }

        // Still processing, wait and retry
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error: any) {
        throw new Error(`Container status check error: ${error.message}`);
      }
    }

    throw new Error('Timeout waiting for media container to be ready');
  }

  /**
   * Get Instagram account insights
   */
  static async getInsights(
    accessToken: string,
    instagramAccountId: string,
    metrics: string[] = ['impressions', 'reach', 'profile_views']
  ): Promise<any> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/insights`,
        {
          params: {
            metric: metrics.join(','),
            period: 'day',
            access_token: accessToken,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      throw new Error(`Instagram Insights Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get media insights (for specific post)
   */
  static async getMediaInsights(
    accessToken: string,
    mediaId: string,
    metrics: string[] = ['engagement', 'impressions', 'reach', 'saved']
  ): Promise<any> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}/insights`,
        {
          params: {
            metric: metrics.join(','),
            access_token: accessToken,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      throw new Error(`Media Insights Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}
