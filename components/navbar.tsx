'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions';
import { User, Project } from '@/types';
import { ThemeToggle } from '@/components/theme-provider';
import ProjectSwitcher from '@/components/project-switcher';
import { LogOut, User as UserIcon, LayoutGrid } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  projects: Project[];
  currentProjectId: string | null;
}

export default function Navbar({ user, projects, currentProjectId }: NavbarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          backdrop-blur-2xl saturate-[1.8]
          border border-border-light/60
          rounded-2xl px-4 py-2.5
          shadow-island
          transition-all duration-500
        ">
          {/* Left: Logo + Project Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-600 text-white shadow-sm">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="font-semibold text-text-primary text-sm tracking-tight hidden sm:block">
              项目看板
            </span>
            <div className="w-px h-6 bg-border-light/60 mx-1 hidden sm:block" />
            <ProjectSwitcher
              projects={projects}
              currentProjectId={currentProjectId}
            />
          </div>

          {/* Right: Theme + User */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="
                    flex items-center gap-2 px-2.5 py-1.5 rounded-xl
                    hover:bg-surface-hover
                    transition-all duration-200
                  "
                >
                  <div className="
                    w-7 h-7 rounded-lg
                    bg-gradient-to-br from-brand-400 to-brand-600
                    flex items-center justify-center
                    text-white text-xs font-semibold
                    shadow-sm
                  ">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-text-primary hidden sm:block max-w-[80px] truncate">
                    {user.name}
                  </span>
                </button>

                {menuOpen && (
                  <div className="
                    absolute top-full right-0 mt-2 w-48
                    bg-surface border border-border-light
                    rounded-2xl shadow-elevated
                    py-2 z-50
                    animate-scale-in origin-top-right
                  ">
                    <div className="px-4 py-2 border-b border-border-light/50">
                      <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                      <p className="text-xs text-text-tertiary truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="
                        w-full flex items-center gap-3 px-4 py-2.5 text-sm
                        text-error hover:bg-error/5
                        transition-all duration-200
                      "
                    >
                      <LogOut className="w-4 h-4" />
                      {loading ? '退出中...' : '退出登录'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
