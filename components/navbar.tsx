'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions';
import { User } from '@/types';
import { ThemeToggle } from '@/components/theme-provider';
import { LogOut, User as UserIcon, LayoutGrid } from 'lucide-react';

export default function Navbar({ user }: { user: { id: string; name: string; email: string } | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full pt-3 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="
          flex items-center justify-between
          bg-surface/85 dark:bg-surface-elevated/85
          backdrop-blur-2xl saturate-[1.8]
          border border-border-light/50
          rounded-2xl px-4 py-2
          shadow-island
          transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        ">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="font-semibold text-text-primary text-sm tracking-tight">
              项目看板
            </span>
          </div>

          {/* 右侧：主题切换 + 用户信息 */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl
                    hover:bg-surface-hover
                    transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    active:scale-95
                    group"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors duration-200">
                    {user.name}
                  </span>
                </button>

                {/* 用户菜单 */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 w-56 animate-scale-in origin-top-right">
                      <div className="p-1.5 rounded-xl bg-surface dark:bg-surface-elevated border border-border-light shadow-elevated">
                        <div className="px-3 py-2.5 border-b border-border-light/50 mb-1">
                          <p className="text-sm font-medium text-text-primary">{user.name}</p>
                          <p className="text-xs text-text-tertiary mt-0.5">{user.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          disabled={loading}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                            text-text-secondary hover:text-error hover:bg-error-bg
                            transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          {loading ? '退出中...' : '退出登录'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
