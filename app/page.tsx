'use client';
import { useState } from 'react';
import { login, register } from './actions';
import { Wallet, Eye, EyeOff } from 'lucide-react';
export default function HomePage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
    } catch (err: unknown) {
      // Re-throw Next.js redirect errors so the framework can handle navigation
      if (
        err instanceof Error &&
        'digest' in err &&
        typeof (err as { digest: unknown }).digest === 'string' &&
        (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
      ) {
        throw err;
      }
      setError((err as { message?: string }).message || '操作失败，请重试');
      setLoading(false);
    }
  }
  return (
    <div className="min-h-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white mb-2">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">我的记账本</h1>
          <p className="text-sm text-zinc-500">简洁高效的个人财务管理</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex rounded-lg bg-zinc-100 p-0.5 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              注册
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">昵称</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的名字"
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">邮箱</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">密码</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 active:bg-zinc-950 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? '处理中...' : mode === 'login' ? '登录' : '创建账户'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-zinc-400">数据存储在云端数据库中，安全可靠</p>
      </div>
    </div>
  );
}
