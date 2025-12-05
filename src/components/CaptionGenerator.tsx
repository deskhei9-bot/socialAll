import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Wand2, RefreshCw, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

interface AIProvider {
  name: string;
  configured: boolean;
  models: {
    id: string;
    name: string;
    description: string;
  }[];
}

interface CaptionGeneratorProps {
  onGenerate: (caption: string) => void;
  topic?: string;
  platforms?: string[];
  currentCaption?: string;
}

const TONE_OPTIONS = [
  { value: 'engaging', label: 'Engaging', icon: '✨' },
  { value: 'professional', label: 'Professional', icon: '💼' },
  { value: 'casual', label: 'Casual', icon: '😊' },
  { value: 'friendly', label: 'Friendly', icon: '👋' },
  { value: 'informative', label: 'Informative', icon: '📚' },
  { value: 'funny', label: 'Funny', icon: '😄' },
  { value: 'inspiring', label: 'Inspiring', icon: '🌟' },
  { value: 'promotional', label: 'Promotional', icon: '📣' },
];

const IMPROVE_OPTIONS = [
  { value: 'shorter', label: 'Make it shorter' },
  { value: 'longer', label: 'Make it longer' },
  { value: 'professional', label: 'More professional' },
  { value: 'casual', label: 'More casual' },
  { value: 'engaging', label: 'More engaging' },
  { value: 'cta', label: 'Add call to action' },
];

export const CaptionGenerator = ({ 
  onGenerate, 
  topic, 
  platforms = [],
  currentCaption 
}: CaptionGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [tone, setTone] = useState('engaging');
  const [customTopic, setCustomTopic] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('auto');
  const [model, setModel] = useState('');
  const [providers, setProviders] = useState<Record<string, AIProvider>>({});
  const [hasProvider, setHasProvider] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const { toast } = useToast();

  // Fetch available AI providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('https://socialautoupload.com/api/ai/providers', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || {});
          setHasProvider(data.hasAnyProvider);
          
          // Set default provider and model
          if (data.providers?.gemini?.configured) {
            setProvider('gemini');
            setModel('gemini-2.0-flash');
          } else if (data.providers?.openai?.configured) {
            setProvider('openai');
            setModel('gpt-4o-mini');
          }
        }
      } catch (error) {
        console.error('Failed to fetch AI providers:', error);
      }
    };
    fetchProviders();
  }, []);

  const handleGenerate = async () => {
    const finalTopic = customTopic || topic || 'general topic';
    
    setGenerating(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Please login to use AI features');
      }

      const response = await fetch('https://socialautoupload.com/api/ai/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: finalTopic,
          description: description || undefined,
          platforms: platforms.length > 0 ? platforms : ['general'],
          tone: tone,
          provider: provider === 'auto' ? 'auto' : provider,
          model: model || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate caption');
      }

      const data = await response.json();
      
      if (data.caption) {
        onGenerate(data.caption);
        setOpen(false);
        toast({
          title: "Caption Generated! ✨",
          description: `Generated using ${data.model || 'AI'}`,
        });
      } else {
        throw new Error('No caption received');
      }
    } catch (error: any) {
      console.error('Caption generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please check your API key configuration",
        variant: "destructive",
      });
    }
    
    setGenerating(false);
  };

  const handleImprove = async (instruction: string) => {
    if (!currentCaption) {
      toast({
        title: "No caption to improve",
        description: "Please write or generate a caption first",
        variant: "destructive",
      });
      return;
    }

    setImproving(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('https://socialautoupload.com/api/ai/improve-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          caption: currentCaption,
          instruction: instruction,
          platforms: platforms.length > 0 ? platforms : ['general'],
          provider: provider === 'auto' ? 'auto' : provider,
          model: model || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to improve caption');
      }

      const data = await response.json();
      
      if (data.caption) {
        onGenerate(data.caption);
        toast({
          title: "Caption Improved! ✨",
          description: `Applied: ${instruction}`,
        });
      }
    } catch (error: any) {
      console.error('Caption improvement error:', error);
      toast({
        title: "Improvement Failed",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setImproving(false);
  };

  const getAvailableModels = () => {
    if (provider === 'auto' || !providers[provider]) {
      return [];
    }
    return providers[provider]?.models || [];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg gap-1.5 text-xs border hover:border-primary/50 hover:bg-primary/10 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Generate</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="generate" className="gap-1.5 text-xs">
              <Sparkles className="w-3 h-3" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="improve" className="gap-1.5 text-xs" disabled={!currentCaption}>
              <Wand2 className="w-3 h-3" />
              Improve
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="p-3 space-y-3 mt-0">
            {!hasProvider && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                ⚠️ Configure GEMINI_API_KEY or OPENAI_API_KEY in backend .env
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="topic" className="text-xs">Topic</Label>
              <Input
                id="topic"
                placeholder="What's your post about?"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs">Additional Context (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more details for better results..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm min-h-[60px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="tone" className="text-xs">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone" className="h-8 text-xs">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.icon} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="provider" className="text-xs">AI Provider</Label>
                <Select value={provider} onValueChange={(v) => {
                  setProvider(v);
                  setModel(''); // Reset model when provider changes
                }}>
                  <SelectTrigger id="provider" className="h-8 text-xs">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto" className="text-xs">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Auto
                      </span>
                    </SelectItem>
                    {providers.gemini?.configured && (
                      <SelectItem value="gemini" className="text-xs">
                        <span className="flex items-center gap-1">
                          <Brain className="w-3 h-3" /> Gemini
                        </span>
                      </SelectItem>
                    )}
                    {providers.openai?.configured && (
                      <SelectItem value="openai" className="text-xs">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> OpenAI
                        </span>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {provider !== 'auto' && getAvailableModels().length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger id="model" className="h-8 text-xs">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableModels().map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-xs">
                        <div className="flex flex-col">
                          <span>{m.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {platforms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {platforms.map((p) => (
                  <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {p}
                  </Badge>
                ))}
              </div>
            )}

            <Button 
              onClick={handleGenerate} 
              disabled={generating || !hasProvider}
              className="w-full h-8 text-xs gap-1.5"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Caption
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="improve" className="p-3 space-y-3 mt-0">
            <p className="text-xs text-muted-foreground">
              Select an option to improve your current caption:
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {IMPROVE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs justify-start"
                  disabled={improving}
                  onClick={() => handleImprove(option.label)}
                >
                  {improving ? (
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                  )}
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              Current: "{currentCaption?.substring(0, 50)}..."
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
