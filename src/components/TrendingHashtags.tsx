import { useState } from 'react';
import { TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest } from '@/lib/api/client';

interface TrendingHashtagsProps {
  onAdd: (hashtags: string[]) => void;
  platforms?: string[];
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'tech', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'fitness', label: 'Fitness & Health' },
  { value: 'food', label: 'Food & Cooking' },
  { value: 'travel', label: 'Travel' },
  { value: 'fashion', label: 'Fashion & Beauty' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Music' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'sports', label: 'Sports' },
  { value: 'news', label: 'News & Politics' },
  { value: 'art', label: 'Art & Design' },
];

const PLATFORMS_LIST = [
  { value: 'all', label: 'All Platforms' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'pinterest', label: 'Pinterest' },
];

export const TrendingHashtags = ({ onAdd, platforms }: TrendingHashtagsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>("general");
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    platforms && platforms.length === 1 ? platforms[0] : "all"
  );
  const { toast } = useToast();

  const handleFetchTrending = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiRequest<{ hashtags: string[] }>('/ai/trending-hashtags', {
        body: {
          category,
          platform: selectedPlatform,
          platforms: platforms || [],
        },
      });

      if (error) throw error;
      
      setSuggestions(data?.hashtags || []);
      
      toast({
        title: "Trending Hashtags",
        description: `Found ${data?.hashtags?.length || 0} trending hashtags`,
      });
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      toast({
        title: "Failed to Fetch",
        description: error instanceof Error ? error.message : "Failed to fetch trending hashtags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = () => {
    onAdd(suggestions);
    setSuggestions([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg gap-1.5 text-xs hover:bg-primary/10 transition-all"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trending</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Trending Hashtags
            </h4>
            <p className="text-xs text-muted-foreground">
              Get popular hashtags by platform and category
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trending-platform" className="text-xs">Platform</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger id="trending-platform" className="h-9 text-sm">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS_LIST.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trending-category" className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="trending-category" className="h-9 text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleFetchTrending} 
            disabled={loading}
            className="w-full h-9 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5 mr-2" />
                Get Trending
              </>
            )}
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-2 p-2.5 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer text-[10px] px-2 py-0.5 hover:bg-primary/20 transition-colors"
                    onClick={() => onAdd([tag])}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAll}
                className="w-full h-7 text-xs"
              >
                Add All ({suggestions.length})
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
