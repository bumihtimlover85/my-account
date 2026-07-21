'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions';
import { User } from '@/types';
import { ThemeToggle } from '@/components/theme-provider';
import { LogOut, User as UserIcon, LayoutGrid } from 'lucide-react';

export default function Navbar({ user }: { user: User | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="
          flex items-center justify-between
          bg-surface/80 dark:bg-surface/80
          backdrop-blur-xl saturate-150
          border border-border-light
          rounded-2xl px-5 py-2.5
          shadow-island
          transition-all duration-300
        ">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-600 text-white">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="font-semibold text-text-primary text-sm tracking-tight">
              项目看板
            </span>
          </div>

          {/* Right side */}
          {user && (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="h-5 w-px bg-border-light mx-1" />
              <div className="flex items-center gap-2 px-2">
                <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                </div>
                <span className="text-sm text-text-secondary hidden sm:block">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  text-text-secondary hover:text-error
                  hover:bg-error/5
                  text-sm transition-all duration-200 ease-out-expo
                  active:scale-95
                  disabled:opacity-50
                  focus:outline-none focus:ring-2 focus:ring-error/30
                "
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{loading ? '退出中...' : '退出'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
