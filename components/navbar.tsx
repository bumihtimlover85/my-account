'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, Tags, Settings, LogOut, Wallet } from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/app/actions';

const navItems = [
  { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/transactions', label: '记账', icon: List },
  { href: '/categories', label: '分类', icon: Tags },
  { href: '/settings', label: '设置', icon: Settings },
];

interface Props {
  user: { name: string; email: string } | null;
}

export default function Navbar({ user }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-900 font-bold text-lg">
            <Wallet className="w-6 h-6 text-blue-600" />
            <span>我的记账本</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-zinc-500">{user.name}</span>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              </>
            ) : (
              <Link
                href="/"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                登录
              </Link>
            )}
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="切换菜单"
            aria-expanded={mobileOpen}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        <div
          className={`md:hidden border-t border-zinc-200 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          {user && (
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-zinc-50 w-full"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          )}
        </div>
      </header>
      <div className="h-16" />
    </>
  );
}
