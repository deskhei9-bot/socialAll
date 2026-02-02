import { AlertTriangle, Clock, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface DuplicateMatch {
  id: string;
  content: string;
  status: string;
  platforms: string[];
  created_at: string;
  publish_count: number;
}

interface DuplicateWarningProps {
  matches: DuplicateMatch[];
  hasConflict: boolean;
  conflictingPlatforms: string[];
  onDismiss: () => void;
}

export function DuplicateWarning({ matches, hasConflict, conflictingPlatforms, onDismiss }: DuplicateWarningProps) {
  if (matches.length === 0) return null;

  return (
    <Alert variant={hasConflict ? "destructive" : "default"} className="relative animate-slide-down">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between pr-8">
        {hasConflict ? 'Duplicate Content Detected!' : 'Similar Content Found'}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm">
          {hasConflict ? (
            <>
              You've already published similar content to <strong>{conflictingPlatforms.join(', ')}</strong>.
              Publishing again may be seen as spam.
            </>
          ) : (
            <>
              Found {matches.length} similar post{matches.length > 1 ? 's' : ''} in the last 30 days.
            </>
          )}
        </p>

        <div className="space-y-2">
          {matches.slice(0, 3).map((match) => (
            <div
              key={match.id}
              className="p-3 rounded-md bg-muted/50 border border-border/50 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground flex-1 line-clamp-2">
                  {match.content}
                </p>
                <Badge variant="outline" className="text-xs">
                  {match.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}</span>
                  {match.publish_count > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 dark:text-green-400">
                        Published to {match.publish_count} platform{match.publish_count > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {match.platforms.slice(0, 3).map((platform) => (
                    <Badge key={platform} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {matches.length > 3 && (
          <p className="text-xs text-muted-foreground italic">
            + {matches.length - 3} more similar post{matches.length - 3 > 1 ? 's' : ''}
          </p>
        )}

        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Consider modifying your content or changing the publishing schedule to avoid duplication.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
