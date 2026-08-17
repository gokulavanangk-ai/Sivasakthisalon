import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminUser } from '@/types';
import { authLogin, authLogout, fetchMe } from '@/services/api';

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isAdminPath = (pathname: string) =>
  pathname.startsWith('/admin') || pathname === '/admin';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [manualUser, setManualUser] = useState<AdminUser | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: isAdminPath(location.pathname),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = manualUser ?? (isError ? null : (data ?? null));

  const login = useCallback(
    async (identifier: string, password: string) => {
      const admin = await authLogin(identifier, password);
      setManualUser(admin);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch {
      /* ignore */
    }
    setManualUser(null);
    queryClient.setQueryData(['auth', 'me'], null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isLoading: isLoading && !isError,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, isLoading, isError, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}