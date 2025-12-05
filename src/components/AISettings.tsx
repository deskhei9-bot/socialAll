import { useState, useEffect } from 'react';
import { Sparkles, Check, X, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getAIProviders, GetProvidersResponse } from '@/lib/api/ai';

interface ProviderInfo {
  name: string;
  configured: boolean;
  models: { id: string; name: string; description: string }[];
}

const PROVIDER_DOCS = {
  gemini: {
    name: 'Google Gemini',
    description: 'Google\'s advanced AI models for text generation',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    icon: '🔮',
    envKey: 'GEMINI_API_KEY',
  },
  openai: {
    name: 'OpenAI GPT',
    description: 'OpenAI\'s powerful GPT models for content creation',
    docsUrl: 'https://platform.openai.com/api-keys',
    icon: '🤖',
    envKey: 'OPENAI_API_KEY',
  },
};

export const AISettings = () => {
  const [providers, setProviders] = useState<Record<string, ProviderInfo>>({});
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const { data } = await getAIProviders();
      if (data?.providers) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Failed to fetch AI providers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI provider status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleTestProvider = async (providerId: string) => {
    setTesting(providerId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/test-provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ provider: providerId }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Connection Successful",
          description: `${PROVIDER_DOCS[providerId as keyof typeof PROVIDER_DOCS]?.name || providerId} is working correctly`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data.error || "Failed to connect to AI provider",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not test the AI provider",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAnyProvider = Object.values(providers).some(p => p.configured);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            AI Settings
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage AI providers for caption generation and hashtag suggestions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProviders} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {!hasAnyProvider && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="font-medium">No AI Providers Configured</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure at least one AI provider in your backend .env file to enable AI features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {Object.entries(PROVIDER_DOCS).map(([id, info]) => {
          const provider = providers[id];
          const isConfigured = provider?.configured || false;
          const models = provider?.models || [];

          return (
            <Card key={id} className={isConfigured ? 'border-primary/30' : 'opacity-75'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{info.icon}</span>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {info.name}
                        {isConfigured ? (
                          <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
                            <Check className="w-3 h-3 mr-1" />
                            Configured
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground">
                            <X className="w-3 h-3 mr-1" />
                            Not Configured
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">{info.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConfigured ? (
                  <>
                    <div>
                      <p className="text-sm font-medium mb-2">Available Models</p>
                      <div className="flex flex-wrap gap-2">
                        {models.map((model) => (
                          <Badge key={model.id} variant="outline" className="px-3 py-1">
                            {model.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestProvider(id)}
                      disabled={testing === id}
                      className="gap-2"
                    >
                      {testing === id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Test Connection
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">Configuration Required</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add <code className="px-1 py-0.5 rounded bg-muted">{info.envKey}</code> to your backend .env file
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href={info.docsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Get API Key
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Configuration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Backend .env Configuration</p>
            <div className="p-3 rounded-lg bg-muted/50 font-mono text-xs space-y-1">
              <p className="text-muted-foreground"># Google Gemini</p>
              <p>GEMINI_API_KEY=your_gemini_api_key</p>
              <p className="text-muted-foreground mt-2"># OpenAI</p>
              <p>OPENAI_API_KEY=your_openai_api_key</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>After adding API keys, restart your backend server:</p>
            <code className="block mt-1 p-2 rounded bg-muted/50 font-mono text-xs">
              pm2 restart social-symphony-api
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
