import { useState } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export function useTwitterOAuth() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const connectTwitter = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to connect your Twitter/X account",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Redirect to backend OAuth endpoint with userId
      const apiUrl = import.meta.env.VITE_API_URL || 'https://socialautoupload.com/api';
      window.location.href = `${apiUrl}/oauth/twitter?userId=${user.id}`;
      
    } catch (error) {
      console.error('Twitter OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Twitter OAuth. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    // Callback is handled by backend
    return { data: null, error: null };
  };

  return {
    connectTwitter,
    handleCallback,
    loading,
  };
}
