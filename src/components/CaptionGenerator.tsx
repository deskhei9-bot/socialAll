import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
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

interface CaptionGeneratorProps {
  onGenerate: (caption: string) => void;
  topic?: string;
  platforms?: string[];
}

export const CaptionGenerator = ({ onGenerate, topic, platforms = [] }: CaptionGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [tone, setTone] = useState('engaging');
  const [customTopic, setCustomTopic] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

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
          platforms: platforms.length > 0 ? platforms : ['general'],
          tone: tone,
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
          description: "AI has created a caption for you",
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
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold">AI Caption Generator</h4>
            <p className="text-xs text-muted-foreground">
              Generate engaging captions
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-xs">Topic (Optional)</Label>
            <Input
              id="topic"
              placeholder="Enter topic..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tone" className="text-xs">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone" className="h-9 text-sm">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="engaging">Engaging</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="informative">Informative</SelectItem>
                <SelectItem value="funny">Funny</SelectItem>
                <SelectItem value="inspiring">Inspiring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={generating}
            className="w-full h-9 text-sm gap-1.5"
          >
            {generating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
