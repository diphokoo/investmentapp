import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  signIn as supabaseSignIn,
  signOut as supabaseSignOut,
  restoreCustomerSession,
  updateCustomerProfile,
  AppUser,
} from './supabase';

type EditableUserFields = Pick<AppUser,
  'first_name' | 'last_name' | 'email' | 'phone' |
  'language' | 'appearance' | 'notifications_enabled'
>;

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<EditableUserFields>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, loading: true, error: '',
  login: async () => false,
  logout: async () => {},
  clearError: () => {},
  updateUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      try {
        const restoredUser = await restoreCustomerSession();
        if (mounted) setUser(restoredUser);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? 'Could not restore your session.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void restore();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const appUser = await supabaseSignIn(email, password);
      setUser(appUser);
      return true;
    } catch (err: any) {
      setError(err?.message ?? 'Sign in failed.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await supabaseSignOut();
    } finally {
      setUser(null);
      setError('');
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<EditableUserFields>) => {
    if (!user) throw new Error('You must be signed in to update your account.');
    const updatedUser = await updateCustomerProfile(updates);
    setUser(current => current ? { ...current, ...updatedUser } : updatedUser);
  }, [user]);

  const clearError = useCallback(() => setError(''), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
