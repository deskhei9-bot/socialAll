import { useState } from 'react';
import { Trash2, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePosts } from '@/hooks/usePosts';

interface BulkActionsProps {
  selectedPosts: string[];
  onClearSelection: () => void;
}

export function BulkActions({ selectedPosts, onClearSelection }: BulkActionsProps) {
  const { deletePost, posts } = usePosts();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      for (const postId of selectedPosts) {
        await deletePost(postId);
      }
      onClearSelection();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleExportCSV = () => {
    const selectedPostsData = posts.filter(p => selectedPosts.includes(p.id));
    
    // Create CSV content
    const headers = ['Title', 'Content', 'Status', 'Platforms', 'Created At', 'Scheduled At'];
    const rows = selectedPostsData.map(post => [
      post.title || '',
      post.content.replace(/"/g, '""'), // Escape quotes
      post.status,
      post.platforms?.join(', ') || '',
      new Date(post.created_at).toLocaleString(),
      post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `posts-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (selectedPosts.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 flex items-center gap-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <Checkbox checked disabled />
            <span className="text-sm font-medium">
              {selectedPosts.length} posts selected
            </span>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              CSV Export
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-2"
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedPosts.length} posts?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected posts will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
