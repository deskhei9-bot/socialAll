import { apiRequest, endpoints } from './client';

// ============================================
// AI Providers
// ============================================

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface AIProvider {
  name: string;
  configured: boolean;
  models: AIModel[];
}

export interface GetProvidersResponse {
  providers: Record<string, AIProvider>;
  hasAnyProvider: boolean;
}

export async function getAIProviders() {
  return apiRequest<GetProvidersResponse>(endpoints.aiProviders);
}

// ============================================
// AI Caption Generation
// ============================================

export interface GenerateCaptionParams {
  title: string;
  platforms?: string[];
  tone?: 'engaging' | 'professional' | 'casual' | 'friendly' | 'informative' | 'funny' | 'inspiring' | 'promotional';
  description?: string;
  provider?: 'auto' | 'gemini' | 'openai';
  model?: string;
  language?: string;
  maxLength?: number;
}

export interface GenerateCaptionResponse {
  caption: string;
  provider?: string;
  model?: string;
}

export async function generateCaption(params: GenerateCaptionParams) {
  return apiRequest<GenerateCaptionResponse>(endpoints.generateCaption, {
    body: params,
  });
}

// ============================================
// AI Caption Improvement
// ============================================

export interface ImproveCaptionParams {
  caption: string;
  instruction: string;
  platforms?: string[];
  provider?: 'auto' | 'gemini' | 'openai';
  model?: string;
}

export interface ImproveCaptionResponse {
  caption: string;
}

export async function improveCaption(params: ImproveCaptionParams) {
  return apiRequest<ImproveCaptionResponse>(endpoints.improveCaption, {
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
  provider?: 'auto' | 'gemini' | 'openai';
  model?: string;
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
