// API Client for self-hosted backend
const API_URL = import.meta.env.VITE_API_URL || 'https://socialautoupload.com/api';

export type ApiMode = 'self-hosted' | 'edge';
export const API_MODE: ApiMode = 'self-hosted';

export function isEdgeMode(): boolean {
  return API_MODE === 'edge';
}

export function isSelfHostedMode(): boolean {
  return API_MODE === 'self-hosted';
}

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || (options.body ? 'POST' : 'GET'),
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  verify: '/auth/verify',
  
  // Posts
  posts: '/posts',
  
  // Channels
  channels: '/channels',
  
  // AI
  aiProviders: '/ai/providers',
  generateCaption: '/ai/generate-caption',
  suggestHashtags: '/ai/suggest-hashtags',
  improveCaption: '/ai/improve-caption',
  testApiKey: '/ai/test-key',
  
  // OAuth
  facebookOAuth: '/oauth/facebook',
  facebookCallback: '/oauth/facebook/callback',
  facebookPost: '/publish/facebook',
  
  youtubeOAuth: '/oauth/youtube',
  youtubeCallback: '/oauth/youtube/callback',
  youtubeUpload: '/publish/youtube',
  
  tiktokOAuth: '/oauth/tiktok',
  tiktokCallback: '/oauth/tiktok/callback',
  tiktokUpload: '/publish/tiktok',
  
  // Analytics
  analytics: '/analytics',
  
  // Upload
  upload: '/upload',
};
