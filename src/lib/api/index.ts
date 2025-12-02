// Main API exports
export { 
  apiRequest, 
  endpoints,
  API_MODE,
  isEdgeMode, 
  isSelfHostedMode 
} from './client';

export { 
  getApiBaseUrl,
  SELF_HOSTED_API_URL,
  SUPABASE_URL 
} from './config';

// OAuth APIs
export {
  initFacebookOAuth,
  handleFacebookCallback,
  postToFacebook,
  initYouTubeOAuth,
  handleYouTubeCallback,
  uploadToYouTube,
  initTikTokOAuth,
  handleTikTokCallback,
  uploadToTikTok,
} from './oauth';

export type {
  FacebookOAuthInitParams,
  FacebookOAuthCallbackParams,
  FacebookPostParams,
  YouTubeOAuthInitParams,
  YouTubeOAuthCallbackParams,
  YouTubeUploadParams,
  TikTokOAuthInitParams,
  TikTokOAuthCallbackParams,
  TikTokUploadParams,
} from './oauth';

// AI APIs
export {
  generateCaption,
  suggestHashtags,
  testApiKey,
} from './ai';

export type {
  GenerateCaptionParams,
  GenerateCaptionResponse,
  SuggestHashtagsParams,
  SuggestHashtagsResponse,
  TestApiKeyParams,
  TestApiKeyResponse,
} from './ai';
