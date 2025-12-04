import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { isPast, addDays } from 'date-fns';

export interface Channel {
  id: string;
  user_id: string;
  platform: string;
  account_name: string;
  account_handle: string;
  followers_count: number;
  is_active: boolean;
  status?: string;
  account_id?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  created_at: string;
  updated_at: string;
}

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_EXPIRY_THRESHOLD_DAYS = 7; // Refresh tokens expiring within 7 days

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingChannels, setRefreshingChannels] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchChannels = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await apiClient.getChannels();
      
      if (error) {
        throw error;
      }

      setChannels((data as Channel[]) || []);
    } catch (error: any) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Error fetching channels",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const refreshChannelToken = useCallback(async (channelId: string): Promise<{ success: boolean; error?: Error }> => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    setRefreshingChannels(prev => new Set(prev).add(channelId));

    try {
      const { data, error } = await apiClient.refreshChannelToken(channelId);

      if (error) {
        throw error;
      }

      await fetchChannels();

      toast({
        title: "Token refreshed",
        description: "Channel connection has been renewed successfully.",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error refreshing channel token:', error);
      toast({
        title: "Token refresh failed",
        description: error.message || "Please reconnect the channel manually.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setRefreshingChannels(prev => {
        const newSet = new Set(prev);
        newSet.delete(channelId);
        return newSet;
      });
    }
  }, [user, toast]);

  const checkAndRefreshExpiredTokens = useCallback(async () => {
    if (!user || channels.length === 0) return;

    const now = new Date();
    const thresholdDate = addDays(now, TOKEN_EXPIRY_THRESHOLD_DAYS);

    const channelsNeedingRefresh = channels.filter(channel => {
      if (!channel.token_expires_at || !channel.refresh_token) return false;
      
      const expiryDate = new Date(channel.token_expires_at);
      // Refresh if expired or expiring within threshold
      return isPast(expiryDate) || expiryDate < thresholdDate;
    });

    for (const channel of channelsNeedingRefresh) {
      // Skip if already refreshing
      if (refreshingChannels.has(channel.id)) continue;

      console.log(`Auto-refreshing token for channel: ${channel.account_name} (${channel.platform})`);
      await refreshChannelToken(channel.id);
    }
  }, [user, channels, refreshingChannels, refreshChannelToken]);

  const refreshAllExpiredTokens = useCallback(async () => {
    const expiredChannels = channels.filter(channel => {
      if (!channel.token_expires_at) return false;
      return isPast(new Date(channel.token_expires_at));
    });

    if (expiredChannels.length === 0) {
      toast({
        title: "All tokens valid",
        description: "No expired tokens found.",
      });
      return;
    }

    toast({
      title: "Refreshing tokens",
      description: `Refreshing ${expiredChannels.length} expired token(s)...`,
    });

    let successCount = 0;
    for (const channel of expiredChannels) {
      const result = await refreshChannelToken(channel.id);
      if (result.success) successCount++;
    }

    toast({
      title: "Token refresh complete",
      description: `Successfully refreshed ${successCount} of ${expiredChannels.length} token(s).`,
    });
  }, [channels, refreshChannelToken, toast]);

  // Initial fetch
  useEffect(() => {
    fetchChannels();
  }, [user]);

  // Auto-refresh interval
  useEffect(() => {
    if (!user) return;

    // Initial check after channels load
    const initialCheckTimeout = setTimeout(() => {
      checkAndRefreshExpiredTokens();
    }, 3000);

    // Set up periodic checks
    autoRefreshIntervalRef.current = setInterval(() => {
      checkAndRefreshExpiredTokens();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      clearTimeout(initialCheckTimeout);
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [user, checkAndRefreshExpiredTokens]);

  const addChannel = async (channel: {
    platform: string;
    account_name: string;
    account_handle: string;
    followers_count?: number;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
  }): Promise<{ data?: Channel; error: Error | null }> => {
    if (!user) return { data: undefined, error: new Error('Not authenticated') };

    try {
      const { data, error } = await apiClient.addChannel({
        ...channel,
        access_token: channel.access_token || '',
      });

      if (error) {
        throw error;
      }

      await fetchChannels();

      toast({
        title: "Channel added",
        description: `${channel.account_name} has been connected successfully.`,
      });

      return { data: data as Channel, error: null };
    } catch (error: any) {
      console.error('Error adding channel:', error);
      toast({
        title: "Error adding channel",
        description: error.message,
        variant: "destructive",
      });
      return { data: undefined, error };
    }
  };

  const removeChannel = async (id: string): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await apiClient.deleteChannel(id);

      if (error) {
        throw error;
      }

      await fetchChannels();

      toast({
        title: "Channel removed",
        description: "The channel has been disconnected successfully.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error removing channel:', error);
      toast({
        title: "Error removing channel",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateChannel = async (
    id: string,
    updates: Partial<Channel>
  ): Promise<{ data?: Channel; error: Error | null }> => {
    if (!user) return { data: undefined, error: new Error('Not authenticated') };

    try {
      const { data, error } = await apiClient.updateChannel(id, updates);

      if (error) {
        throw error;
      }

      await fetchChannels();

      return { data: data as Channel, error: null };
    } catch (error: any) {
      console.error('Error updating channel:', error);
      return { data: undefined, error };
    }
  };

  const isChannelRefreshing = (channelId: string) => refreshingChannels.has(channelId);

  return {
    channels,
    loading,
    addChannel,
    removeChannel,
    updateChannel,
    refetch: fetchChannels,
    refreshChannelToken,
    refreshAllExpiredTokens,
    isChannelRefreshing,
  };
}
