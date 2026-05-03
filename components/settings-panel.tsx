'use client';
import { useState } from 'react';
import { exportUserData, resetUserData } from '@/app/actions';
import { Download, Upload, Trash2, AlertTriangle, User } from 'lucide-react';

interface Props {
  user: { name: string; email: string };
}

export default function SettingsPanel({ user }: Props) {
  const [showReset, setShowReset] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `记账备份_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('数据已导出');
    } catch {
      setMessage('导出失败');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2000);
    }
  }

  async function handleReset() {
    setLoading(true);
    try {
      await resetUserData();
      setShowReset(false);
      setMessage('数据已重置');
    } catch {
      setMessage('重置失败');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2000);
    }
  }

  return (
    <>
      {message && (
        <div className="px-4 py-3 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium animate-in fade-in">{message}</div>
      )}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">{user.name}</p>
            <p className="text-xs text-zinc-400">{user.email}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900">数据管理</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-50"
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
              placeholder="功能开发中：后续支持从 JSON 导入..."
              rows={4}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:border-blue-500 bg-zinc-50"
            />
            <p className="text-xs text-zinc-400">导入功能将在后续版本中支持</p>
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border border-red-100 p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-red-700">危险区域</h2>
        <button
          onClick={() => setShowReset(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
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
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >确认清空</button>
              <button
                onClick={() => setShowReset(false)}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 cursor-pointer"
              >取消</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
