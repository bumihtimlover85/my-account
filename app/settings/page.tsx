import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Navbar from '@/components/navbar';
import SettingsPanel from '@/components/settings-panel';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        <h1 className="text-xl font-bold text-zinc-900">设置</h1>
        <SettingsPanel user={user} />
      </main>
    </>
  );
}
