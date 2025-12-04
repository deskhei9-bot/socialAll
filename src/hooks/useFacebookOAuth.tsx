import { useState } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export function useFacebookOAuth() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const connectFacebook = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to connect your Facebook account",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Redirect to backend OAuth endpoint with userId
      const apiUrl = import.meta.env.VITE_API_URL || 'https://socialautoupload.com/api';
      window.location.href = `${apiUrl}/oauth/facebook?userId=${user.id}`;
      
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Facebook OAuth. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    // Callback is handled by backend, which redirects back to dashboard
    // Frontend just needs to refresh the channels list
    return { data: null, error: null };
  };

  return {
    connectFacebook,
    handleCallback,
    loading,
  };
}
