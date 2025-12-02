import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      setIsAdmin(user?.role === 'admin');
      setLoading(false);
    }
  }, [user, authLoading]);

  return { isAdmin, loading };
}
