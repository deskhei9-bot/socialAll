import { useState } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export function usePinterestOAuth() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const connectPinterest = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to connect your Pinterest account",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Redirect to backend OAuth endpoint with userId
      const apiUrl = import.meta.env.VITE_API_URL || 'https://socialautoupload.com/api';
      window.location.href = `${apiUrl}/oauth/pinterest?userId=${user.id}`;
      
    } catch (error) {
      console.error('Pinterest OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Pinterest OAuth. Please try again.",
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
    connectPinterest,
    handleCallback,
    loading,
  };
}
