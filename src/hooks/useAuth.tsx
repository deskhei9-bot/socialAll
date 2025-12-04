import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  createdAt?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      const storedUser = apiClient.getStoredUser();
      
      if (storedUser) {
        // Verify token is still valid
        const { valid, user: verifiedUser } = await apiClient.verifyToken();
        
        if (valid && verifiedUser) {
          setUser(verifiedUser);
        } else {
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await apiClient.signUp(email, password, fullName);
      
      if (error) {
        return { error };
      }

      if (data?.user) {
        setUser(data.user);
      }

      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Sign up failed') 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await apiClient.signIn(email, password);
      
      if (error) {
        return { error };
      }

      if (data?.user) {
        setUser(data.user);
      }

      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Sign in failed') 
      };
    }
  };

  const signOut = async () => {
    await apiClient.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
