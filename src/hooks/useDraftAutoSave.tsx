import { useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface DraftData {
  content: string;
  media_urls?: string[];
  platforms?: string[];
  scheduled_at?: string | null;
  hashtags?: string[];
  title?: string;
}

const DRAFT_KEY = 'social_auto_upload_draft';
const DRAFT_TIMESTAMP_KEY = 'social_auto_upload_draft_timestamp';

export function useDraftAutoSave() {
  /**
   * Save draft to localStorage
   */
  const saveDraft = useCallback((draft: DraftData) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      localStorage.setItem(DRAFT_TIMESTAMP_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, []);

  /**
   * Debounced save function (1 second delay)
   */
  const debouncedSave = useCallback(
    debounce((draft: DraftData) => {
      saveDraft(draft);
    }, 1000),
    [saveDraft]
  );

  /**
   * Load draft from localStorage
   */
  const loadDraft = useCallback((): { draft: DraftData | null; timestamp: string | null } => {
    try {
      const draftStr = localStorage.getItem(DRAFT_KEY);
      const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
      
      if (!draftStr) {
        return { draft: null, timestamp: null };
      }

      const draft = JSON.parse(draftStr) as DraftData;
      return { draft, timestamp };
    } catch (error) {
      console.error('Failed to load draft:', error);
      return { draft: null, timestamp: null };
    }
  }, []);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  /**
   * Check if draft exists
   */
  const hasDraft = useCallback((): boolean => {
    return localStorage.getItem(DRAFT_KEY) !== null;
  }, []);

  return {
    saveDraft: debouncedSave,
    loadDraft,
    clearDraft,
    hasDraft,
  };
}
