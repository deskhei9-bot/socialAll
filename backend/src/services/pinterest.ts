/**
 * Pinterest API Service
 * Documentation: https://developers.pinterest.com/docs/api/v5/
 * 
 * Features:
 * - Create pins (image posts)
 * - Upload images
 * - Get user boards
 * - OAuth 2.0 authentication
 */

import axios from 'axios';

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

export interface PinParams {
  accessToken: string;
  boardId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  altText?: string;
}

export interface BoardParams {
  accessToken: string;
  name: string;
  description?: string;
  privacy?: 'PUBLIC' | 'PROTECTED' | 'SECRET';
}

export class PinterestService {
  /**
   * Create a pin from image URL
   */
  static async createPin(params: PinParams) {
    try {
      const response = await axios.post(
        `${PINTEREST_API_BASE}/pins`,
        {
          board_id: params.boardId,
          title: params.title,
          description: params.description || '',
          link: params.link || undefined,
          alt_text: params.altText || params.title,
          media_source: {
            source_type: 'image_url',
            url: params.imageUrl
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${params.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[Pinterest] Pin created successfully:', response.data.id);

      return {
        success: true,
        pinId: response.data.id,
        pinUrl: `https://www.pinterest.com/pin/${response.data.id}/`
      };
    } catch (error: any) {
      console.error('[Pinterest] Create pin error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create pin'
      };
    }
  }

  /**
   * Upload image file as pin
   */
  static async uploadImagePin(params: PinParams & { imageBuffer: Buffer; fileName: string }) {
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('board_id', params.boardId);
    form.append('title', params.title);
    
    if (params.description) {
      form.append('description', params.description);
    }
    
    if (params.link) {
      form.append('link', params.link);
    }
    
    form.append('alt_text', params.altText || params.title);
    
    form.append('media_source', params.imageBuffer, {
      filename: params.fileName,
      contentType: 'image/jpeg'
    });

    try {
      const response = await axios.post(
        `${PINTEREST_API_BASE}/pins`,
        form,
        {
          headers: {
            'Authorization': `Bearer ${params.accessToken}`,
            ...form.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log('[Pinterest] Image uploaded successfully:', response.data.id);

      return {
        success: true,
        pinId: response.data.id,
        pinUrl: `https://www.pinterest.com/pin/${response.data.id}/`
      };
    } catch (error: any) {
      console.error('[Pinterest] Upload error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Upload failed'
      };
    }
  }

  /**
   * Get user's boards
   */
  static async getBoards(accessToken: string) {
    try {
      const response = await axios.get(
        `${PINTEREST_API_BASE}/boards`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            page_size: 25
          }
        }
      );

      return {
        success: true,
        boards: response.data.items.map((board: any) => ({
          id: board.id,
          name: board.name,
          description: board.description,
          privacy: board.privacy,
          pinCount: board.pin_count
        }))
      };
    } catch (error: any) {
      console.error('[Pinterest] Get boards error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get boards'
      };
    }
  }

  /**
   * Create a new board
   */
  static async createBoard(params: BoardParams) {
    try {
      const response = await axios.post(
        `${PINTEREST_API_BASE}/boards`,
        {
          name: params.name,
          description: params.description || '',
          privacy: params.privacy || 'PUBLIC'
        },
        {
          headers: {
            'Authorization': `Bearer ${params.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[Pinterest] Board created:', response.data.id);

      return {
        success: true,
        boardId: response.data.id,
        boardName: response.data.name
      };
    } catch (error: any) {
      console.error('[Pinterest] Create board error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create board'
      };
    }
  }

  /**
   * Get user account info
   */
  static async getUserInfo(accessToken: string) {
    try {
      const response = await axios.get(
        `${PINTEREST_API_BASE}/user_account`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return {
        success: true,
        user: {
          username: response.data.username,
          profileImage: response.data.profile_image,
          accountType: response.data.account_type,
          websiteUrl: response.data.website_url
        }
      };
    } catch (error: any) {
      console.error('[Pinterest] Get user info error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get user info'
      };
    }
  }

  /**
   * Delete a pin
   */
  static async deletePin(accessToken: string, pinId: string) {
    try {
      await axios.delete(
        `${PINTEREST_API_BASE}/pins/${pinId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      console.log('[Pinterest] Pin deleted:', pinId);

      return {
        success: true
      };
    } catch (error: any) {
      console.error('[Pinterest] Delete pin error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete pin'
      };
    }
  }

  /**
   * Get analytics for a pin (requires business account)
   */
  static async getPinAnalytics(accessToken: string, pinId: string) {
    try {
      const response = await axios.get(
        `${PINTEREST_API_BASE}/pins/${pinId}/analytics`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            metric_types: 'IMPRESSION,SAVE,PIN_CLICK,OUTBOUND_CLICK'
          }
        }
      );

      return {
        success: true,
        analytics: response.data
      };
    } catch (error: any) {
      console.error('[Pinterest] Get analytics error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get analytics'
      };
    }
  }
}
