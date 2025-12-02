import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface LinkedInCompanyPage {
  id: string;
  name: string;
  description?: string;
  logo?: string;
}

interface LinkedInPostResponse {
  id: string;
  activityUrn: string;
}

interface LinkedInMediaUploadResponse {
  value: {
    uploadMechanism: {
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': {
        uploadUrl: string;
        headers: Record<string, string>;
      };
    };
    asset: string;
    mediaArtifact: string;
  };
}

export class LinkedInService {
  private static readonly API_BASE = 'https://api.linkedin.com/v2';
  private static readonly API_VERSION = '202304';

  /**
   * Post to personal LinkedIn profile
   */
  static async postToProfile(
    accessToken: string,
    authorId: string,
    text: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ): Promise<LinkedInPostResponse> {
    try {
      const response = await axios.post(
        `${this.API_BASE}/ugcPosts`,
        {
          author: `urn:li:person:${authorId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: text,
              },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': visibility,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': this.API_VERSION,
          },
        }
      );

      return {
        id: response.data.id,
        activityUrn: response.headers['x-restli-id'] || response.data.id,
      };
    } catch (error: any) {
      throw new Error(
        `LinkedIn post to profile failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Post to LinkedIn company page
   */
  static async postToCompanyPage(
    accessToken: string,
    organizationId: string,
    text: string,
    visibility: 'PUBLIC' | 'DARK' = 'PUBLIC'
  ): Promise<LinkedInPostResponse> {
    try {
      const response = await axios.post(
        `${this.API_BASE}/ugcPosts`,
        {
          author: `urn:li:organization:${organizationId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: text,
              },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': visibility,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': this.API_VERSION,
          },
        }
      );

      return {
        id: response.data.id,
        activityUrn: response.headers['x-restli-id'] || response.data.id,
      };
    } catch (error: any) {
      throw new Error(
        `LinkedIn post to company page failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Post with image to LinkedIn
   */
  static async postWithImage(
    accessToken: string,
    authorUrn: string,
    text: string,
    imageUrl: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ): Promise<LinkedInPostResponse> {
    try {
      // Step 1: Register image upload
      const uploadResponse = await this.registerImageUpload(accessToken, authorUrn);
      const uploadUrl = uploadResponse.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const assetUrn = uploadResponse.value.asset;

      // Step 2: Upload image
      const imageBuffer = await this.downloadImage(imageUrl);
      await axios.put(uploadUrl, imageBuffer, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'image/png',
        },
      });

      // Step 3: Create post with image
      const response = await axios.post(
        `${this.API_BASE}/ugcPosts`,
        {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: text,
              },
              shareMediaCategory: 'IMAGE',
              media: [
                {
                  status: 'READY',
                  media: assetUrn,
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': visibility,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': this.API_VERSION,
          },
        }
      );

      return {
        id: response.data.id,
        activityUrn: response.headers['x-restli-id'] || response.data.id,
      };
    } catch (error: any) {
      throw new Error(
        `LinkedIn post with image failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Post with video to LinkedIn
   */
  static async postWithVideo(
    accessToken: string,
    authorUrn: string,
    text: string,
    videoUrl: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ): Promise<LinkedInPostResponse> {
    try {
      // Step 1: Register video upload
      const uploadResponse = await this.registerVideoUpload(accessToken, authorUrn);
      const uploadUrl = uploadResponse.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const assetUrn = uploadResponse.value.asset;

      // Step 2: Upload video
      const videoBuffer = await this.downloadVideo(videoUrl);
      await axios.put(uploadUrl, videoBuffer, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'video/mp4',
        },
      });

      // Step 3: Create post with video
      const response = await axios.post(
        `${this.API_BASE}/ugcPosts`,
        {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: text,
              },
              shareMediaCategory: 'VIDEO',
              media: [
                {
                  status: 'READY',
                  media: assetUrn,
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': visibility,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': this.API_VERSION,
          },
        }
      );

      return {
        id: response.data.id,
        activityUrn: response.headers['x-restli-id'] || response.data.id,
      };
    } catch (error: any) {
      throw new Error(
        `LinkedIn post with video failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Post article to LinkedIn
   */
  static async postArticle(
    accessToken: string,
    authorUrn: string,
    title: string,
    text: string,
    articleUrl: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
  ): Promise<LinkedInPostResponse> {
    try {
      const response = await axios.post(
        `${this.API_BASE}/ugcPosts`,
        {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: text,
              },
              shareMediaCategory: 'ARTICLE',
              media: [
                {
                  status: 'READY',
                  originalUrl: articleUrl,
                  title: {
                    text: title,
                  },
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': visibility,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': this.API_VERSION,
          },
        }
      );

      return {
        id: response.data.id,
        activityUrn: response.headers['x-restli-id'] || response.data.id,
      };
    } catch (error: any) {
      throw new Error(
        `LinkedIn post article failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Get user profile information
   */
  static async getUserProfile(accessToken: string): Promise<LinkedInProfile> {
    try {
      const response = await axios.get(`${this.API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': this.API_VERSION,
        },
      });

      return {
        id: response.data.id,
        firstName: response.data.localizedFirstName || response.data.firstName?.localized?.en_US,
        lastName: response.data.localizedLastName || response.data.lastName?.localized?.en_US,
        profilePicture: response.data.profilePicture?.displayImage,
      };
    } catch (error: any) {
      throw new Error(
        `LinkedIn get user profile failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Get company page information
   */
  static async getCompanyPage(accessToken: string, organizationId: string): Promise<LinkedInCompanyPage> {
    try {
      const response = await axios.get(
        `${this.API_BASE}/organizations/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'LinkedIn-Version': this.API_VERSION,
          },
        }
      );

      return {
        id: response.data.id,
        name: response.data.localizedName || response.data.name?.localized?.en_US,
        description: response.data.localizedDescription || response.data.description?.localized?.en_US,
        logo: response.data.logoV2?.original,
      };
    } catch (error: any) {
      throw new Error(
        `LinkedIn get company page failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Get post analytics/statistics
   */
  static async getPostAnalytics(
    accessToken: string,
    postUrn: string
  ): Promise<{
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    clicks: number;
  }> {
    try {
      const response = await axios.get(
        `${this.API_BASE}/socialActions/${encodeURIComponent(postUrn)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'LinkedIn-Version': this.API_VERSION,
          },
        }
      );

      return {
        likes: response.data.likesSummary?.totalLikes || 0,
        comments: response.data.commentsSummary?.totalComments || 0,
        shares: response.data.sharesSummary?.totalShares || 0,
        impressions: response.data.impressionCount || 0,
        clicks: response.data.clickCount || 0,
      };
    } catch (error: any) {
      throw new Error(
        `LinkedIn get post analytics failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Delete a post
   */
  static async deletePost(accessToken: string, postUrn: string): Promise<void> {
    try {
      await axios.delete(`${this.API_BASE}/ugcPosts/${encodeURIComponent(postUrn)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': this.API_VERSION,
        },
      });
    } catch (error: any) {
      throw new Error(
        `LinkedIn delete post failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  // Helper methods

  private static async registerImageUpload(
    accessToken: string,
    authorUrn: string
  ): Promise<LinkedInMediaUploadResponse> {
    const response = await axios.post(
      `${this.API_BASE}/assets?action=registerUpload`,
      {
        registerUploadRequest: {
          owner: authorUrn,
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': this.API_VERSION,
        },
      }
    );

    return response.data;
  }

  private static async registerVideoUpload(
    accessToken: string,
    authorUrn: string
  ): Promise<LinkedInMediaUploadResponse> {
    const response = await axios.post(
      `${this.API_BASE}/assets?action=registerUpload`,
      {
        registerUploadRequest: {
          owner: authorUrn,
          recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': this.API_VERSION,
        },
      }
    );

    return response.data;
  }

  private static async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  private static async downloadVideo(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }
}
