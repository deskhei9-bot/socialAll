import { apiRequest, endpoints } from './client';

// ============================================
// AI Caption Generation
// ============================================

export interface GenerateCaptionParams {
  title: string;
  platforms?: string[];
  tone?: 'engaging' | 'professional' | 'casual' | 'humorous';
  description?: string;
  mediaType?: string;
}

export interface GenerateCaptionResponse {
  caption: string;
}

export async function generateCaption(params: GenerateCaptionParams) {
  return apiRequest<GenerateCaptionResponse>(endpoints.generateCaption, {
    body: params,
  });
}

// ============================================
// AI Hashtag Suggestions
// ============================================

export interface SuggestHashtagsParams {
  content: string;
  platforms?: string[];
  count?: number;
}

export interface SuggestHashtagsResponse {
  hashtags: string[];
}

export async function suggestHashtags(params: SuggestHashtagsParams) {
  return apiRequest<SuggestHashtagsResponse>(endpoints.suggestHashtags, {
    body: params,
  });
}

// ============================================
// API Key Testing
// ============================================

export interface TestApiKeyParams {
  provider: 'gemini' | 'openai';
  apiKey: string;
}

export interface TestApiKeyResponse {
  valid: boolean;
  message: string;
}

export async function testApiKey(params: TestApiKeyParams) {
  return apiRequest<TestApiKeyResponse>(endpoints.testApiKey, {
    body: params,
  });
}
