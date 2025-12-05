import { FileText, Sparkles, Shield } from 'lucide-react';
import { CaptionTemplateManager } from '@/components/CaptionTemplateManager';
import { Card, CardContent } from '@/components/ui/card';

const Templates = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Caption Templates
        </h1>
        <p className="text-muted-foreground mt-1">
          Create and manage reusable caption templates with AI generation
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-sm">AI-Powered & Policy Compliant</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate templates using Gemini or GPT-4 that follow all social platform community guidelines including Facebook, Instagram, YouTube, TikTok, Twitter, LinkedIn, and Pinterest policies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-3xl">
        <CaptionTemplateManager mode="manage" />
      </div>
    </div>
  );
};

export default Templates;
