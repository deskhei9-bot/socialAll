import { useState } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export function useYouTubeOAuth() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const connectYouTube = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to connect your YouTube channel",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Redirect to backend OAuth endpoint with userId
      const apiUrl = import.meta.env.VITE_API_URL || 'https://socialautoupload.com/api';
      window.location.href = `${apiUrl}/oauth/youtube?userId=${user.id}`;
      
    } catch (error) {
      console.error('YouTube OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to initiate YouTube OAuth. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    // Callback is handled by backend, which redirects back to channels page
    // Frontend just needs to refresh the channels list
    return { data: null, error: null };
  };

  return {
    connectYouTube,
    handleCallback,
    loading,
  };
}
