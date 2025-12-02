import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface ActivityLog {
  id: string;
  user_id: string;
  type: string;
  message: string;
  platform: string | null;
  post_id: string | null;
  metadata: any;
  created_at: string;
}

export function useActivityLogs(limit: number = 20) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchLogs = async () => {
    // TODO: Implement activity logs API endpoint
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [user, limit]);

  const addLog = async (log: {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    platform?: string;
    post_id?: string;
    metadata?: Record<string, unknown>;
  }) => {
    // Store in local state for now
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      user_id: user?.id || '',
      type: log.type,
      message: log.message,
      platform: log.platform || null,
      post_id: log.post_id || null,
      metadata: log.metadata || {},
      created_at: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev.slice(0, limit - 1)]);
  };

  return { logs, loading, addLog, refetch: fetchLogs };
}
