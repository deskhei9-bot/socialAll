import { useState } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export function useTikTokOAuth() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const connectTikTok = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to connect your TikTok account",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to connect your TikTok account",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'https://socialautoupload.com/api';
      const response = await fetch(`${apiUrl}/oauth/tiktok?response=json`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Failed to initiate OAuth');
      }

      window.location.href = data.url;
      
    } catch (error) {
      console.error('TikTok OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to initiate TikTok OAuth. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    // Callback is handled by backend, which redirects back to channels page
    return { data: null, error: null };
  };

  return {
    connectTikTok,
    handleCallback,
    loading,
  };
}
