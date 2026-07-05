import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '项目看板 - 团队任务管理',
  description: '多人协同的项目管理看板',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
