import { useState } from 'react';
import { Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const API_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'AI model for hashtag suggestions and caption generation',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIza...'
  }
];

export const ApiKeySettings = () => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    // TODO: Implement API key saving to backend
    toast({
      title: "Coming Soon",
      description: "API key management will be available soon",
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Key className="w-6 h-6" />
        API Keys
      </h2>
      
      {API_PROVIDERS.map((provider) => (
        <Card key={provider.id}>
          <CardHeader>
            <CardTitle>{provider.name}</CardTitle>
            <CardDescription>{provider.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder={provider.placeholder}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                Save API Key
              </Button>
              <Button variant="outline" asChild>
                <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer">
                  Get API Key
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
