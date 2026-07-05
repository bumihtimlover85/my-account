'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions';
import { LayoutDashboard, LogOut } from 'lucide-react';

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/boards" className="flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">看板管理</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                退出
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
