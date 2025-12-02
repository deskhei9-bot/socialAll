import { apiRequest, endpoints, isEdgeMode } from './client';

// ============================================
// Facebook OAuth
// ============================================

export interface FacebookOAuthInitParams {
  state: string;
  userId: string;
}

export interface FacebookOAuthCallbackParams {
  code: string;
  state: string;
  userId: string;
}

export async function initFacebookOAuth(params: FacebookOAuthInitParams) {
  if (isEdgeMode()) {
    return apiRequest<{ url: string }>(endpoints.facebookOAuth, {
      body: { action: 'init', ...params },
    });
  }
  return apiRequest<{ url: string }>(endpoints.facebookOAuth, {
    body: params,
  });
}

export async function handleFacebookCallback(params: FacebookOAuthCallbackParams) {
  if (isEdgeMode()) {
    return apiRequest<{ success: boolean; pages: any[] }>(endpoints.facebookCallback, {
      body: { action: 'callback', ...params },
    });
  }
  return apiRequest<{ success: boolean; pages: any[] }>(endpoints.facebookCallback, {
    body: params,
  });
}

export interface FacebookPostParams {
  channelId: string;
  message: string;
  mediaUrl?: string;
  userId: string;
}

export async function postToFacebook(params: FacebookPostParams) {
  return apiRequest<{ success: boolean; postId: string }>(endpoints.facebookPost, {
    body: params,
  });
}

// ============================================
// YouTube OAuth
// ============================================

export interface YouTubeOAuthInitParams {
  state: string;
  userId: string;
}

export interface YouTubeOAuthCallbackParams {
  code: string;
  state: string;
  userId: string;
}

export async function initYouTubeOAuth(params: YouTubeOAuthInitParams) {
  if (isEdgeMode()) {
    return apiRequest<{ url: string }>(endpoints.youtubeOAuth, {
      body: { action: 'init', ...params },
    });
  }
  return apiRequest<{ url: string }>(endpoints.youtubeOAuth, {
    body: params,
  });
}

export async function handleYouTubeCallback(params: YouTubeOAuthCallbackParams) {
  if (isEdgeMode()) {
    return apiRequest<{ success: boolean; channel: any }>(endpoints.youtubeCallback, {
      body: { action: 'callback', ...params },
    });
  }
  return apiRequest<{ success: boolean; channel: any }>(endpoints.youtubeCallback, {
    body: params,
  });
}

export interface YouTubeUploadParams {
  channelId: string;
  title: string;
  description: string;
  videoUrl: string;
  userId: string;
  privacyStatus?: 'public' | 'private' | 'unlisted';
}

export async function uploadToYouTube(params: YouTubeUploadParams) {
  return apiRequest<{ success: boolean; videoId: string; url: string }>(endpoints.youtubeUpload, {
    body: params,
  });
}

// ============================================
// TikTok OAuth
// ============================================

export interface TikTokOAuthInitParams {
  state: string;
  userId: string;
}

export interface TikTokOAuthCallbackParams {
  code: string;
  state: string;
  userId: string;
  codeVerifier: string;
}

export async function initTikTokOAuth(params: TikTokOAuthInitParams) {
  if (isEdgeMode()) {
    return apiRequest<{ url: string; codeVerifier: string }>(endpoints.tiktokOAuth, {
      body: { action: 'init', ...params },
    });
  }
  return apiRequest<{ url: string; codeVerifier: string }>(endpoints.tiktokOAuth, {
    body: params,
  });
}

export async function handleTikTokCallback(params: TikTokOAuthCallbackParams) {
  if (isEdgeMode()) {
    return apiRequest<{ success: boolean; user: any }>(endpoints.tiktokCallback, {
      body: { action: 'callback', ...params },
    });
  }
  return apiRequest<{ success: boolean; user: any }>(endpoints.tiktokCallback, {
    body: params,
  });
}

export interface TikTokUploadParams {
  channelId: string;
  title: string;
  videoUrl: string;
  userId: string;
}

export async function uploadToTikTok(params: TikTokUploadParams) {
  return apiRequest<{ success: boolean; publishId: string }>(endpoints.tiktokUpload, {
    body: params,
  });
}
