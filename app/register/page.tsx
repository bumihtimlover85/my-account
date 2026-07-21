'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/app/actions';
import { LayoutGrid, Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-brand-400/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm sm:max-w-md animate-scale-in relative z-10">
        {/* 双边框卡片 */}
        <div className="p-[1.5px] rounded-2xl bg-gradient-to-b from-border-light/80 to-transparent dark:from-border-light/20">
          <div className="rounded-[calc(20px-1.5px)] bg-surface dark:bg-surface-elevated shadow-elevated">
            <div className="p-8 sm:p-10">
              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20 flex items-center justify-center mb-3 animate-float">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-semibold text-text-primary">创建账号</h1>
                <p className="text-sm text-text-tertiary mt-1">加入项目看板，开始协作</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 姓名 */}
                <div className="group">
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 ml-1">
                    姓名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-brand-500 transition-colors duration-200" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-border-light rounded-xl pl-10 pr-3.5 py-2.5 text-sm
                        bg-surface dark:bg-surface-muted text-text-primary placeholder:text-text-tertiary
                        outline-none transition-all duration-200
                        focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
                      placeholder="你的名字"
                      required
                    />
                  </div>
                </div>

                {/* 邮箱 */}
                <div className="group">
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 ml-1">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-brand-500 transition-colors duration-200" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-border-light rounded-xl pl-10 pr-3.5 py-2.5 text-sm
                        bg-surface dark:bg-surface-muted text-text-primary placeholder:text-text-tertiary
                        outline-none transition-all duration-200
                        focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div className="group">
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 ml-1">
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-brand-500 transition-colors duration-200" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-border-light rounded-xl pl-10 pr-10 py-2.5 text-sm
                        bg-surface dark:bg-surface-muted text-text-primary placeholder:text-text-tertiary
                        outline-none transition-all duration-200
                        focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
                      placeholder="至少 6 位字符"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="animate-slide-up">
                    <p className="text-sm text-error bg-error-bg rounded-xl px-3.5 py-2.5 border border-error/10">
                      {error}
                    </p>
                  </div>
                )}

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                    bg-gradient-to-br from-brand-500 to-brand-600 text-white text-sm font-medium
                    hover:from-brand-600 hover:to-brand-700
                    shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30
                    transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-brand-500/40
                    relative overflow-hidden
                  "
                >
                  {loading && (
                    <span className="absolute inset-0 bg-white/10 animate-shimmer" />
                  )}
                  <UserPlus className="w-4 h-4" />
                  {loading ? '注册中...' : '注册'}
                </button>
              </form>

              <p className="text-center mt-6 text-sm text-text-tertiary">
                已有账号？{' '}
                <Link
                  href="/login"
                  className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300
                    font-medium transition-colors duration-200
                    hover:underline underline-offset-4 decoration-brand-500/30"
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
