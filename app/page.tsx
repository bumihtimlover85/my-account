'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStore } from '@/lib/store';
import { User } from '@/types';
import { generateId } from '@/lib/utils';
import { Wallet, Eye, EyeOff } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getStore().getData().user) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const data = getStore().getData();
    if (!email.trim() || !password.trim()) {
      setError('请填写完整信息');
      return;
    }

    if (data.user) {
      if (data.user.email === email.trim() && data.user.password === password) {
        router.push('/dashboard');
      } else {
        setError('邮箱或密码错误');
      }
    } else {
      const newUser: User = {
        id: generateId(),
        name: email.split('@')[0],
        email: email.trim(),
        password,
      };
      getStore().setUser(newUser);
      router.push('/dashboard');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('请填写完整信息');
      return;
    }
    const newUser: User = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      password,
    };
    getStore().setUser(newUser);
    router.push('/dashboard');
  };

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
          <div className="flex rounded-lg bg-zinc-100 p-0.5 mb-6" role="tablist" aria-label="登录注册切换">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              role="tab"
              aria-selected={mode === 'login'}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              role="tab"
              aria-selected={mode === 'register'}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              注册
            </button>
          </div>
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-zinc-700 mb-1.5">邮箱</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-zinc-700 mb-1.5">密码</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 active:bg-zinc-950 transition-colors cursor-pointer"
              >
                登录
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-zinc-700 mb-1.5">昵称</label>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的名字"
                  autoComplete="name"
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-zinc-700 mb-1.5">邮箱</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-zinc-700 mb-1.5">密码</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 active:bg-zinc-950 transition-colors cursor-pointer"
              >
                创建账户
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-zinc-400">
          数据存储在本地浏览器中，不会上传到服务器
        </p>
      </div>
    </div>
  );
}
