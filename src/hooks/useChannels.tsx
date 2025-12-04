import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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

  useEffect(() => {
    fetchChannels();
  }, [user]);

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

  return {
    channels,
    loading,
    addChannel,
    removeChannel,
    updateChannel,
    refetch: fetchChannels,
  };
}
