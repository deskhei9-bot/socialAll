import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Post {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  media_urls: string[];
  platforms: any[];
  hashtags: string[];
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await apiClient.getPosts();
      
      if (error) {
        throw error;
      }

      setPosts((data as Post[]) || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const createPost = async (post: {
    title?: string;
    content: string;
    platforms: string[];
    media_urls?: string[];
    hashtags?: string[];
    status?: string;
    scheduled_at?: string;
    post_type?: string;
    metadata?: any;
    selected_channel_ids?: string[];
  }): Promise<{ data?: Post; error: Error | null }> => {
    if (!user) return { data: undefined, error: new Error('Not authenticated') };

    try {
      const { data, error } = await apiClient.createPost({
        title: post.title,
        content: post.content,
        platforms: post.platforms,
        media_url: post.media_urls?.[0], // Keep for backward compatibility
        media_urls: post.media_urls || [], // NEW: Send full array
        post_type: post.post_type || 'text',
        metadata: post.metadata,
        selected_channel_ids: post.selected_channel_ids,
        status: post.status || 'draft',
        scheduled_for: post.scheduled_at,
      });

      if (error) {
        throw error;
      }

      await fetchPosts();

      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      });

      return { data: data as Post, error: null };
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
      return { data: undefined, error };
    }
  };

  const updatePost = async (
    id: string,
    updates: Partial<Post>
  ): Promise<{ data?: Post; error: Error | null }> => {
    if (!user) return { data: undefined, error: new Error('Not authenticated') };

    try {
      const { data, error } = await apiClient.updatePost(id, updates);

      if (error) {
        throw error;
      }

      await fetchPosts();

      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });

      return { data: data as Post, error: null };
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast({
        title: "Error updating post",
        description: error.message,
        variant: "destructive",
      });
      return { data: undefined, error };
    }
  };

  const deletePost = async (id: string): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await apiClient.deletePost(id);

      if (error) {
        throw error;
      }

      await fetchPosts();

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const retryPublish = async (id: string): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Get the post
      const post = posts.find(p => p.id === id);
      if (!post) {
        throw new Error('Post not found');
      }

      // Increment retry count
      const retryCount = ((post as any).metadata?.retryCount || 0) + 1;

      // Update metadata with retry count
      const updatedPost = {
        ...post,
        status: 'queued',
        metadata: {
          ...(post as any).metadata,
          retryCount,
          lastRetryAt: new Date().toISOString(),
        },
      };

      const { error } = await apiClient.updatePost(id, updatedPost as any);

      if (error) {
        throw error;
      }

      await fetchPosts();

      toast({
        title: "Retrying post",
        description: `Attempt: ${retryCount}/3`,
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error retrying post:', error);
      toast({
        title: "Cannot retry",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    retryPublish,
    refetch: fetchPosts,
  };
}
