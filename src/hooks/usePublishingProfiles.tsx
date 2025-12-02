import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PublishingProfile {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  channel_ids: string[];
  is_default: boolean;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export function usePublishingProfiles() {
  const [profiles, setProfiles] = useState<PublishingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfiles = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('https://socialautoupload.com/api/publishing-profiles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data);
    } catch (error: any) {
      console.error('Error fetching publishing profiles:', error);
      toast({
        title: "Error fetching profiles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const createProfile = async (profile: {
    name: string;
    description?: string;
    channel_ids: string[];
    is_default?: boolean;
    color?: string;
    icon?: string;
  }) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('https://socialautoupload.com/api/publishing-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create profile');
      }

      const data = await response.json();
      
      toast({
        title: "Profile created",
        description: `"${profile.name}" has been created successfully`,
      });

      await fetchProfiles();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateProfile = async (id: string, updates: Partial<PublishingProfile>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://socialautoupload.com/api/publishing-profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const data = await response.json();
      
      toast({
        title: "Profile updated",
        description: "Profile has been updated successfully",
      });

      await fetchProfiles();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://socialautoupload.com/api/publishing-profiles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete profile');
      }

      toast({
        title: "Profile deleted",
        description: "Profile has been deleted successfully",
      });

      await fetchProfiles();
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Error deleting profile",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const getProfileChannels = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://socialautoupload.com/api/publishing-profiles/${id}/channels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile channels');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error fetching profile channels:', error);
      toast({
        title: "Error fetching channels",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    profiles,
    loading,
    createProfile,
    updateProfile,
    deleteProfile,
    getProfileChannels,
    refetch: fetchProfiles,
  };
}
