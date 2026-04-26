'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStore } from '@/lib/store';
import Navbar from '@/components/navbar';
import { Download, Upload, Trash2, AlertTriangle, User } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(getStore().getData().user);
  const [showReset, setShowReset] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!getStore().getData().user) {
      router.replace('/');
      return;
    }
    const unsub = getStore().subscribe(() => setUser(getStore().getData().user));
    return unsub;
  }, [router]);

  const handleExport = () => {
    const data = getStore().exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `记账备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('数据已导出');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleImport = () => {
    try {
      getStore().importData(importText);
      setMessage('数据导入成功');
      setImportText('');
      setShowImport(false);
    } catch {
      setMessage('导入失败，请检查 JSON 格式');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = () => {
    getStore().resetData();
    setShowReset(false);
    setMessage('数据已重置');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        <h1 className="text-xl font-bold text-zinc-900">设置</h1>

        {message && (
          <div className="px-4 py-3 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">{message}</div>
        )}

        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">{user?.name || '用户'}</p>
              <p className="text-xs text-zinc-400">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">数据管理</h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              导出数据
            </button>
            <button
              onClick={() => setShowImport(!showImport)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              导入数据
            </button>
          </div>

          {showImport && (
            <div className="space-y-2">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="粘贴 JSON 数据..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer"
              >确认导入</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-red-100 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-red-700">危险区域</h2>
          <button
            onClick={() => setShowReset(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            重置所有数据
          </button>

          {showReset && (
            <div className="p-4 rounded-lg bg-red-50 space-y-3">
              <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                此操作不可撤销，确定要清空所有数据吗？
              </div>
              <div className="flex gap-2">
                <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 cursor-pointer">确认清空</button>
                <button onClick={() => setShowReset(false)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 cursor-pointer">取消</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
