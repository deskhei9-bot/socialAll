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
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate with AI
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">AI Caption Generator</h4>
            <p className="text-sm text-muted-foreground">
              Generate engaging captions using AI
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic (Optional)</Label>
            <Input
              id="topic"
              placeholder="Enter topic or leave blank"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
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
            className="w-full gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Caption
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
