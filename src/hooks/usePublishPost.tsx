import { useState } from 'react';
import { useChannels, Channel } from './useChannels';
import { useToast } from './use-toast';

export interface PublishResult {
  platform: string;
  channel_id?: string;
  channel_name?: string;
  success: boolean;
  error?: string;
  postUrl?: string;
}

export function usePublishPost() {
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<PublishResult[]>([]);
  const { channels } = useChannels();
  const { toast } = useToast();

  /**
   * Get all channels for selected platforms (NEW: returns ALL channels, not just first)
   */
  const getChannelsForPlatforms = (platforms: string[]): Channel[] => {
    return channels.filter(ch => platforms.includes(ch.platform) && ch.is_active);
  };

  /**
   * Legacy function for backward compatibility
   */
  const getConnectedChannelsForPlatforms = (platforms: string[]): Channel[] => {
    // Return only first channel per platform (legacy behavior)
    const connectedChannels: Channel[] = [];
    platforms.forEach(platform => {
      const platformChannel = channels.find(ch => ch.platform === platform && ch.is_active);
      if (platformChannel) {
        connectedChannels.push(platformChannel);
      }
    });
    return connectedChannels;
  };

  /**
   * Publish to specific selected channels (NEW)
   */
  const publishToSelectedChannels = async (
    postId: string,
    selectedChannelIds: string[],
    title: string,
    content: string,
    mediaUrls: string[]
  ): Promise<{ success: boolean; results: PublishResult[] }> => {
    if (selectedChannelIds.length === 0) {
      toast({
        title: "No Channels Selected",
        description: "Please select at least one channel to publish to",
        variant: "destructive",
      });
      return { success: false, results: [] };
    }

    setPublishing(true);
    setResults([]);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('https://socialautoupload.com/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: postId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Publishing failed');
      }

      const data = await response.json();
      const publishResults: PublishResult[] = data.results || [];

      setResults(publishResults);
      
      const successCount = publishResults.filter(r => r.success).length;
      const failCount = publishResults.filter(r => !r.success).length;

      if (successCount > 0) {
        toast({
          title: `Published Successfully! 🎉`,
          description: `Published to ${successCount} channel${successCount !== 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}`,
        });
      } else {
        toast({
          title: "Publishing Failed",
          description: "Failed to publish to all channels. Check the results.",
          variant: "destructive",
        });
      }

      setPublishing(false);
      return { 
        success: successCount > 0, 
        results: publishResults 
      };

    } catch (error: any) {
      console.error('Error publishing post:', error);
      
      toast({
        title: "Publishing Error",
        description: error.message || "An error occurred while publishing",
        variant: "destructive",
      });

      setPublishing(false);
      return { success: false, results: [] };
    }
  };

  /**
   * Legacy publish function (for backward compatibility)
   */
  const publishPost = async (
    postId: string,
    title: string,
    content: string,
    platforms: string[],
    media?: string[]
  ): Promise<{ success: boolean; results: PublishResult[] }> => {
    // Get first channel for each platform (legacy behavior)
    const connectedChannels = getConnectedChannelsForPlatforms(platforms);
    const channelIds = connectedChannels.map(ch => ch.id);
    
    return publishToSelectedChannels(postId, channelIds, title, content, media || []);
  };

  return {
    publishPost,
    publishToSelectedChannels, // NEW
    publishing,
    results,
    getConnectedChannelsForPlatforms, // Legacy
    getChannelsForPlatforms, // NEW
  };
}
