import React, { createContext, useContext, useState, useCallback } from 'react';
import { signIn as supabaseSignIn, signOut as supabaseSignOut, AppUser } from './supabase';

interface AuthContextValue {
  user:    AppUser | null;
  loading: boolean;
  error:   string;
  login:   (email: string, password: string) => Promise<boolean>;
  logout:  () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, loading: false, error: '',
  login: async () => false,
  logout: async () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const appUser = await supabaseSignIn(email, password);
      setUser(appUser);
      return true;
    } catch (err: any) {
      setError(err.message ?? 'Sign in failed.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await supabaseSignOut();
    setUser(null);
    setError('');
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
