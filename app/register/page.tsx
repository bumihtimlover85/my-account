'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/app/actions';
import { LayoutGrid, Mail, Lock, User, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await register(name, email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4">
      <div className="animate-scale-in">
        {/* 双边框 */}
        <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-border-light to-transparent">
          <div className="rounded-[calc(20px-1.5px)] bg-surface w-full max-w-sm sm:max-w-md">
            <div className="p-8 sm:p-10">
              {/* Logo */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white shadow-sm">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-text-primary">创建账号</h1>
                  <p className="text-xs text-text-tertiary">加入项目看板</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 姓名 */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    姓名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-border-light rounded-xl pl-10 pr-3.5 py-2.5 text-sm
                        bg-surface text-text-primary placeholder:text-text-tertiary
                        outline-none transition-all duration-200
                        focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      placeholder="你的名字"
                      required
                    />
                  </div>
                </div>

                {/* 邮箱 */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-border-light rounded-xl pl-10 pr-3.5 py-2.5 text-sm
                        bg-surface text-text-primary placeholder:text-text-tertiary
                        outline-none transition-all duration-200
                        focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-border-light rounded-xl pl-10 pr-3.5 py-2.5 text-sm
                        bg-surface text-text-primary placeholder:text-text-tertiary
                        outline-none transition-all duration-200
                        focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      placeholder="至少 6 位字符"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="animate-slide-up">
                    <p className="text-sm text-error bg-error/5 rounded-xl px-3.5 py-2.5 border border-error/10">
                      {error}
                    </p>
                  </div>
                )}

                {/* 提交 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                    bg-brand-600 text-white text-sm font-medium
                    hover:bg-brand-700
                    transition-all duration-200 ease-out-expo
                    active:scale-[0.98]
                    disabled:opacity-50
                    focus:outline-none focus:ring-2 focus:ring-brand-500/40
                  "
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? '注册中...' : '注册'}
                </button>
              </form>

              <p className="text-center mt-6 text-sm text-text-tertiary">
                已有账号？{' '}
                <Link
                  href="/login"
                  className="text-brand-600 hover:text-brand-700 font-medium
                    transition-colors duration-200"
                >
                  登录
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
