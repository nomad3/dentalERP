import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Ensures auth state is hydrated before rendering protected routes
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const setLoading = useAuthStore((s) => s.setLoading);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const tokens = useAuthStore((s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }));
  const loading = useAuthStore((s) => s.loading);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const rehydrate = async () => {
      try {
        setLoading(true);

        // Wait for zustand-persist to finish (best-effort across versions)
        // Prefer built-in helpers when available
        const anyStore: any = useAuthStore as any;
        if (anyStore.persist?.hasHydrated) {
          if (!anyStore.persist.hasHydrated()) {
            await anyStore.persist.rehydrate?.();
          }
        }

        if (cancelled) return;
        setHydrated(true);
        setInitialized(true);

        // If we already have tokens, verify session and fetch profile
        if (tokens.accessToken || tokens.refreshToken) {
          try {
            const profile = await authAPI.getProfile();
            if (!cancelled) setUser(profile?.data || profile?.user || profile || null);
          } catch (e) {
            // 401 handling is centralized in axios interceptor; just ensure state is consistent
            if (!cancelled) clearAuth();
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    rehydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While hydrating/loading, render a minimal loader to avoid premature redirects
  if (!hydrated || loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};
