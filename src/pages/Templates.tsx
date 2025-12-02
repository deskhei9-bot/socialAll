import { FileText } from 'lucide-react';
import { CaptionTemplateManager } from '@/components/CaptionTemplateManager';

const Templates = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Caption Templates
        </h1>
        <p className="text-muted-foreground mt-1">
          Create and manage reusable caption templates with hashtag groups
        </p>
      </div>

      <div className="max-w-2xl">
        <CaptionTemplateManager mode="manage" />
      </div>
    </div>
  );
};

export default Templates;
