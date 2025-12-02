import { useState } from 'react';
import { Plus, Edit2, Trash2, Hash, FileText, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCaptionTemplates, CaptionTemplate } from '@/hooks/useCaptionTemplates';

interface CaptionTemplateManagerProps {
  onApply?: (template: CaptionTemplate) => void;
  mode?: 'manage' | 'select';
}

export const CaptionTemplateManager = ({ onApply, mode = 'manage' }: CaptionTemplateManagerProps) => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useCaptionTemplates();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '', hashtagInput: '' });
  const [hashtags, setHashtags] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({ name: '', content: '', hashtagInput: '' });
    setHashtags([]);
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

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    if (editingId) {
      await updateTemplate(editingId, {
        name: formData.name,
        content: formData.content,
        hashtags,
      });
    } else {
      await createTemplate({
        name: formData.name,
        content: formData.content,
        hashtags,
      });
    }
    resetForm();
  };

  const handleEdit = (template: CaptionTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      content: template.content,
      hashtagInput: '',
    });
    setHashtags(template.hashtags || []);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create/Edit Form */}
      {isCreating ? (
        <Card className="border-primary/50 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {editingId ? 'Edit Template' : 'New Template'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Template name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div>
              <Textarea
                placeholder="Caption content (use {title} for post title)"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[100px] bg-background"
              />
            </div>
            <div>
              <div className="flex gap-2 mb-2">
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
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name.trim()}>
                <Check className="h-4 w-4 mr-1" />
                {editingId ? 'Update' : 'Save'}
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
                    <h4 className="font-medium text-foreground truncate">{template.name}</h4>
                    {template.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {template.content}
                      </p>
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
