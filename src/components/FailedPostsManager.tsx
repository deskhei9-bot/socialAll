import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Trash2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePosts } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';

interface FailedPost {
  id: string;
  content: string;
  platform: string;
  error: string;
  created_at: string;
  retryCount: number;
}

export function FailedPostsManager() {
  const { posts, retryPublish, deletePost } = usePosts();
  const [failedPosts, setFailedPosts] = useState<FailedPost[]>([]);
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    // Filter failed posts
    const failed = posts
      .filter(p => p.status === 'failed')
      .map(p => ({
        id: p.id,
        content: p.content,
        platform: p.metadata?.platform || 'unknown',
        error: p.metadata?.error || 'Unknown error',
        created_at: p.created_at,
        retryCount: p.metadata?.retryCount || 0,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFailedPosts(failed);
  }, [posts]);

  const handleRetry = async (postId: string) => {
    setRetrying(postId);
    try {
      await retryPublish(postId);
      // Post will be removed from failed list automatically when status updates
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setRetrying(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm('Are you sure you want to permanently delete this post?')) {
      await deletePost(postId);
    }
  };

  const translateError = (error: string): string => {
    const errorMap: Record<string, string> = {
      'Network error': 'Network connection problem',
      'Token expired': 'Token has expired',
      'Invalid token': 'Invalid token',
      'Permission denied': 'Permission denied',
      'File too large': 'File size is too large',
      'Invalid file type': 'Invalid file type',
      'Quota exceeded': 'Daily quota limit reached',
      'Rate limit': 'Too many requests at once',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return error; // Return original if no translation found
  };

  if (failedPosts.length === 0) return null;

  return (
    <Card className="glass-card border-destructive/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Failed Posts
          </CardTitle>
          <Badge variant="destructive">{failedPosts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {failedPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize">
                      {post.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-destructive font-medium">
                        {translateError(post.error)}
                      </p>
                      {post.retryCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Retried: {post.retryCount} times
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRetry(post.id)}
                    disabled={retrying === post.id || post.retryCount >= 3}
                    className="gap-2"
                  >
                    {retrying === post.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Retry
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(post.id)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </div>

              {post.retryCount >= 3 && (
                <div className="pt-2 border-t border-destructive/20">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Maximum retry attempts reached. Please check your token or recreate the post.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> If your token has expired, reconnect from the Dashboard.
            If there are network issues, try again later.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
