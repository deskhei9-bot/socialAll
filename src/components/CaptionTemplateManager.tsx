import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Hash, FileText, X, Check, Sparkles, Loader2, Zap, Brain, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useCaptionTemplates, CaptionTemplate } from '@/hooks/useCaptionTemplates';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';

interface CaptionTemplateManagerProps {
  onApply?: (template: CaptionTemplate) => void;
  mode?: 'manage' | 'select';
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

const CATEGORY_OPTIONS = [
  { value: 'product', label: 'Product Launch' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'educational', label: 'Educational' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'behind-scenes', label: 'Behind the Scenes' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'tips', label: 'Tips & Tricks' },
  { value: 'story', label: 'Story/Narrative' },
];

const PLATFORM_OPTIONS = [
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'pinterest', label: 'Pinterest', icon: '📌' },
];

interface AIProvider {
  name: string;
  configured: boolean;
  models: { id: string; name: string; description: string }[];
}

export const CaptionTemplateManager = ({ onApply, mode = 'manage' }: CaptionTemplateManagerProps) => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useCaptionTemplates();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    content: '', 
    hashtagInput: '',
    tone: 'engaging',
    category: '',
    topic: '',
  });
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [provider, setProvider] = useState('auto');
  const [model, setModel] = useState('');
  const [providers, setProviders] = useState<Record<string, AIProvider>>({});
  const [hasProvider, setHasProvider] = useState(false);
  const { toast } = useToast();

  // Fetch AI providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/providers`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || {});
          setHasProvider(data.hasAnyProvider);
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

  const resetForm = () => {
    setFormData({ name: '', content: '', hashtagInput: '', tone: 'engaging', category: '', topic: '' });
    setHashtags([]);
    setSelectedPlatforms([]);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleAddHashtag = () => {
    const tag = formData.hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags(prev => [...prev, tag]);
      setFormData(prev => ({ ...prev, hashtagInput: '' }));
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleAIGenerate = async () => {
    if (!formData.topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for AI generation",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/generate-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: formData.topic,
          tone: formData.tone,
          category: formData.category || undefined,
          platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['general'],
          provider: provider === 'auto' ? undefined : provider,
          model: model || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate template');
      }

      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        name: data.name || `${formData.topic} Template`,
        content: data.content || '',
      }));
      setHashtags(data.hashtags || []);

      toast({
        title: "Template Generated",
        description: "AI generated a policy-compliant template",
      });
    } catch (error: any) {
      console.error('Template generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    if (editingId) {
      await updateTemplate(editingId, {
        name: formData.name,
        content: formData.content,
        hashtags,
        tone: formData.tone,
        platforms: selectedPlatforms,
        category: formData.category || null,
      });
    } else {
      await createTemplate({
        name: formData.name,
        content: formData.content,
        hashtags,
        tone: formData.tone,
        platforms: selectedPlatforms,
        category: formData.category || undefined,
      });
    }
    resetForm();
    toast({
      title: editingId ? "Template Updated" : "Template Created",
      description: "Your caption template has been saved",
    });
  };

  const handleEdit = (template: CaptionTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      content: template.content,
      hashtagInput: '',
      tone: template.tone || 'engaging',
      category: template.category || '',
      topic: '',
    });
    setHashtags(template.hashtags || []);
    setSelectedPlatforms(template.platforms || []);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
    toast({
      title: "Template Deleted",
      description: "Caption template has been removed",
    });
  };

  const getAvailableModels = () => {
    if (provider === 'auto' || !providers[provider]) return [];
    return providers[provider]?.models || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create/Edit Form */}
      {isCreating ? (
        <Card className="border-primary/50 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {editingId ? 'Edit Template' : 'New Template'}
              <Badge variant="outline" className="text-xs gap-1">
                <Shield className="w-3 h-3" />
                Policy Compliant
              </Badge>
            </CardTitle>
            <CardDescription>
              AI will generate content compliant with all social platform policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Generation Section */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Template Generator
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Topic / Theme</Label>
                    <Input
                      placeholder="e.g., Product launch, Summer sale..."
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                      className="bg-background h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tone</Label>
                    <Select 
                      value={formData.tone} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, tone: v }))}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TONE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.icon} {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">AI Provider</Label>
                    <Select 
                      value={provider} 
                      onValueChange={(v) => { setProvider(v); setModel(''); }}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Auto
                          </span>
                        </SelectItem>
                        {providers.gemini?.configured && (
                          <SelectItem value="gemini">
                            <span className="flex items-center gap-1">
                              <Brain className="w-3 h-3" /> Gemini
                            </span>
                          </SelectItem>
                        )}
                        {providers.openai?.configured && (
                          <SelectItem value="openai">
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
                    <Label className="text-xs">Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableModels().map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs">Target Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((platform) => (
                      <label
                        key={platform.value}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border cursor-pointer transition-colors text-xs ${
                          selectedPlatforms.includes(platform.value)
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-background border-border hover:border-primary/50'
                        }`}
                      >
                        <Checkbox
                          checked={selectedPlatforms.includes(platform.value)}
                          onCheckedChange={() => handlePlatformToggle(platform.value)}
                          className="hidden"
                        />
                        <span>{platform.icon}</span>
                        <span>{platform.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleAIGenerate}
                  disabled={generating || !hasProvider || !formData.topic.trim()}
                  className="w-full gap-2"
                  variant="secondary"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </>
                  )}
                </Button>

                {!hasProvider && (
                  <p className="text-xs text-muted-foreground text-center">
                    ⚠️ Configure GEMINI_API_KEY or OPENAI_API_KEY in backend .env
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Manual Input Section */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Template Name</Label>
                <Input
                  placeholder="Template name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs">Caption Content</Label>
                <Textarea
                  placeholder="Caption content (use {title} for post title, {product} for product name)"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[120px] bg-background mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Variables: {'{title}'}, {'{product}'}, {'{brand}'}, {'{link}'}
                </p>
              </div>
              <div>
                <Label className="text-xs">Hashtags</Label>
                <div className="flex gap-2 mt-1.5 mb-2">
                  <Input
                    placeholder="Add hashtag"
                    value={formData.hashtagInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, hashtagInput: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                    className="bg-background"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddHashtag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <button onClick={() => handleRemoveHashtag(tag)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name.trim()}>
                <Check className="h-4 w-4 mr-1" />
                {editingId ? 'Update' : 'Save Template'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsCreating(true)} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create New Template
        </Button>
      )}

      {/* Templates List */}
      <div className="space-y-3">
        {templates.length === 0 && !isCreating ? (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mb-2 opacity-50" />
              <p>No templates yet</p>
              <p className="text-sm">Create your first caption template</p>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="bg-card hover:bg-accent/10 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-foreground">{template.name}</h4>
                      {template.tone && (
                        <Badge variant="outline" className="text-[10px]">
                          {TONE_OPTIONS.find(t => t.value === template.tone)?.icon} {template.tone}
                        </Badge>
                      )}
                    </div>
                    {template.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {template.content}
                      </p>
                    )}
                    {template.platforms && template.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.platforms.map((p) => (
                          <Badge key={p} variant="secondary" className="text-[10px]">
                            {PLATFORM_OPTIONS.find(opt => opt.value === p)?.icon} {p}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {template.hashtags && template.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.hashtags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Hash className="h-3 w-3 mr-0.5" />
                            {tag}
                          </Badge>
                        ))}
                        {template.hashtags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.hashtags.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {mode === 'select' && onApply && (
                      <Button size="sm" onClick={() => onApply(template)}>
                        Apply
                      </Button>
                    )}
                    {mode === 'manage' && (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(template)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(template.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
