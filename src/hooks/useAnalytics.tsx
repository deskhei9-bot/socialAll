import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from './useAuth';

export interface AnalyticsData {
  platform: string;
  impressions: number;
  engagement: number;
  clicks: number;
  shares: number;
}

export interface AnalyticsOverview {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  failedPosts: number;
  successRate: number;
  totalReach: number;
  totalEngagement: number;
  platformStats: any[];
  dailyPosts: any[];
  recentActivity: any[];
  dailyTrends?: { date: string; reach: number; engagement: number }[];
  postStatusDistribution?: { status: string; count: number }[];
  platformBreakdown?: { platform: string; reach: number; engagement: number; posts: number }[];
}

export function useAnalytics(days: number = 30) {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAnalytics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://socialautoupload.com/api/analytics/overview?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user, days]);

  const getPostAnalytics = async (postId: string): Promise<any> => {
    try {
      const response = await fetch(`https://socialautoupload.com/api/analytics/post/${postId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching post analytics:', error);
      return null;
    }
  };

  const getPlatformAnalytics = async (platform: string): Promise<any> => {
    try {
      const response = await fetch(`https://socialautoupload.com/api/analytics/platform/${platform}?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch platform analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      return null;
    }
  };

  const getTimeseries = async (): Promise<any> => {
    try {
      const response = await fetch(`https://socialautoupload.com/api/analytics/timeseries?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timeseries data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching timeseries:', error);
      return null;
    }
  };

  return {
    data,
    loading,
    fetchAnalytics,
    getPostAnalytics,
    getPlatformAnalytics,
    getTimeseries,
  };
}
