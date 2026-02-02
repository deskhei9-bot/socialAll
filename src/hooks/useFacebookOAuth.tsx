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
      
      console.log('🔵 Starting Facebook OAuth flow...');
      
      if (!user?.id) {
        console.warn('❌ No user ID found');
        toast({
          title: "Authentication Required",
          description: "Please log in to connect your Facebook account",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('❌ No auth token found');
        toast({
          title: "Authentication Required",
          description: "Please log in again to connect your Facebook account",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'https://socialautoupload.com/api';
      console.log('📡 Requesting OAuth URL from:', `${apiUrl}/oauth/facebook`);
      
      const response = await fetch(`${apiUrl}/oauth/facebook?response=json`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!response.ok || !data?.url) {
        const errorMsg = data?.error || data?.message || 'Failed to initiate OAuth';
        console.error('❌ OAuth initiation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Redirecting to Facebook OAuth...');
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('❌ Facebook OAuth error:', error);
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to initiate Facebook OAuth. Please try again.",
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
