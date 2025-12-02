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
  }): Promise<{ data?: Post; error: Error | null }> => {
    if (!user) return { data: undefined, error: new Error('Not authenticated') };

    try {
      const { data, error } = await apiClient.createPost({
        title: post.title,
        content: post.content,
        platforms: post.platforms,
        media_url: post.media_urls?.[0],
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

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
}
