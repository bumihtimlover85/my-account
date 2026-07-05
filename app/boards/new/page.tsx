import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CreateBoardForm } from '@/components/create-board-form';

export default async function NewBoardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">创建新看板</h1>
          <p className="mt-2 text-gray-600">创建一个新的项目看板来管理你的任务</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <CreateBoardForm />
        </div>
      </div>
    </div>
  );
}
