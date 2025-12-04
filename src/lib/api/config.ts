// API Configuration for self-hosted backend

export const SELF_HOSTED_API_URL = import.meta.env.VITE_API_URL || 'https://socialautoupload.com/api';
export const SUPABASE_URL = ''; // Not used in self-hosted mode

export function getApiBaseUrl(): string {
  return SELF_HOSTED_API_URL;
}
