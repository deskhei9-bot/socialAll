import { useState, useEffect } from 'react';
import { Hash, Loader2 } from 'lucide-react';
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
import { getAIProviders, suggestHashtags } from '@/lib/api/ai';

interface HashtagSuggestionsProps {
  content: string;
  onAdd: (hashtags: string[]) => void;
  platforms?: string[];
}

const PROVIDER_MODELS = {
  gemini: [
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ],
};

export const HashtagSuggestions = ({ content, onAdd, platforms }: HashtagSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState<string>("10");
  const [provider, setProvider] = useState<string>("auto");
  const [model, setModel] = useState<string>("");
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data } = await getAIProviders();
        const available: string[] = [];
        if (data?.providers?.gemini?.configured) available.push('gemini');
        if (data?.providers?.openai?.configured) available.push('openai');
        setAvailableProviders(available);
      } catch (error) {
        console.error('Failed to fetch AI providers:', error);
      }
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    if (provider === 'gemini') {
      setModel('gemini-2.0-flash');
    } else if (provider === 'openai') {
      setModel('gpt-4o-mini');
    } else {
      setModel('');
    }
  }, [provider]);

  const handleSuggest = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter post content first to generate hashtags",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data } = await suggestHashtags({
        content,
        platforms,
        count: parseInt(count),
        provider: provider !== 'auto' ? provider as 'gemini' | 'openai' : undefined,
        model: model || undefined,
      });
      
      setSuggestions(data?.hashtags || []);
      
      toast({
        title: "Hashtags Generated",
        description: `Generated ${data?.hashtags?.length || 0} hashtags`,
      });
    } catch (error) {
      console.error('Error generating hashtags:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate hashtags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAddAll = () => {
    onAdd(suggestions);
    setSuggestions([]);
  };

  const currentModels = provider === 'gemini' ? PROVIDER_MODELS.gemini : 
                        provider === 'openai' ? PROVIDER_MODELS.openai : [];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5" />
          Hashtags
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!content || generating}
              className="h-8 rounded-lg gap-1.5 text-xs border hover:border-primary/50 hover:bg-primary/10 transition-all"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <Hash className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">AI Suggest</span>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold">AI Hashtag Generator</h4>
                <p className="text-xs text-muted-foreground">
                  Generate relevant hashtags
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hashtag-provider" className="text-xs">AI Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger id="hashtag-provider" className="h-9 text-sm">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Best Available)</SelectItem>
                    {availableProviders.includes('gemini') && (
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                    )}
                    {availableProviders.includes('openai') && (
                      <SelectItem value="openai">OpenAI GPT</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {provider !== 'auto' && currentModels.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="hashtag-model" className="text-xs">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="hashtag-model" className="h-9 text-sm">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentModels.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label htmlFor="count" className="text-xs">Count</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger id="count" className="h-9 text-sm">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 hashtags</SelectItem>
                    <SelectItem value="10">10 hashtags</SelectItem>
                    <SelectItem value="15">15 hashtags</SelectItem>
                    <SelectItem value="20">20 hashtags</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSuggest} 
                disabled={generating || !content}
                className="w-full h-9 text-sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
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
            Add All
          </Button>
        </div>
      )}
    </div>
  );
};