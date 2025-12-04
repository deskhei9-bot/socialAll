import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface CaptionTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  hashtags: string[];
  category: string | null;
  created_at: string;
}

export function useCaptionTemplates() {
  const [templates, setTemplates] = useState<CaptionTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchTemplates = async () => {
    // TODO: Implement templates API endpoint
    // For now, use localStorage
    const stored = localStorage.getItem(`templates_${user?.id}`);
    if (stored) {
      setTemplates(JSON.parse(stored));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const createTemplate = async (template: {
    name: string;
    content: string;
    hashtags?: string[];
    category?: string;
  }) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const newTemplate: CaptionTemplate = {
      id: Date.now().toString(),
      user_id: user.id,
      name: template.name,
      content: template.content,
      hashtags: template.hashtags || [],
      category: template.category || null,
      created_at: new Date().toISOString(),
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem(`templates_${user.id}`, JSON.stringify(updated));

    return { data: newTemplate, error: null };
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem(`templates_${user.id}`, JSON.stringify(updated));

    return { error: null };
  };

  const updateTemplate = async (id: string, updates: Partial<CaptionTemplate>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const updated = templates.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    setTemplates(updated);
    localStorage.setItem(`templates_${user.id}`, JSON.stringify(updated));

    return { data: updated.find(t => t.id === id), error: null };
  };

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
}
