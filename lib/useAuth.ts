'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, removeToken } from './auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    apiFetch('/api/auth/me')
      .then(async (res) => {
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else if (requireAuth) {
          removeToken();
          router.replace('/');
        }
      })
      .catch(() => {
        if (!mounted) return;
        if (requireAuth) {
          removeToken();
          router.replace('/');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [router, requireAuth]);

  const logout = () => {
    removeToken();
    router.replace('/');
  };

  return { user, loading, logout };
}
