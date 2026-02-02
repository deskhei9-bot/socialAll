import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface DuplicateMatch {
  id: string;
  content: string;
  status: string;
  platforms: string[];
  created_at: string;
  publish_count: number;
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  hasConflict: boolean;
  conflictingPlatforms: string[];
  matches: DuplicateMatch[];
}

export function useDuplicateCheck() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<DuplicateCheckResult | null>(null);

  const checkDuplicate = async (content: string, platforms: string[]) => {
    if (!content || content.trim().length < 10) {
      setResult(null);
      return;
    }

    setChecking(true);
    try {
      const response = await fetch('/api/posts/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ content, platforms }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Duplicate check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  // Debounced version for real-time checking
  const debouncedCheck = useCallback(
    debounce((content: string, platforms: string[]) => {
      checkDuplicate(content, platforms);
    }, 1500),
    []
  );

  return {
    checkDuplicate: debouncedCheck,
    checking,
    result,
    clearResult: () => setResult(null),
  };
}
