'use client';

import Navbar from '@/components/navbar';
import StatsCards from '@/components/stats-cards';
import CategoryChart from '@/components/category-chart';
import RecentTransactions from '@/components/recent-transactions';
import TransactionForm from '@/components/transaction-form';
import { useAuth } from '@/lib/useAuth';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth(true);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">仪表盘</h1>
        </div>
        <StatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionForm />
          </div>
          <div>
            <CategoryChart />
          </div>
        </div>
        <RecentTransactions />
      </main>
    </>
  );
}
