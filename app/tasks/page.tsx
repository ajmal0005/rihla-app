import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTasks } from '@/app/actions';
import TasksClient from '@/components/TasksClient';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const session = await getSession();
  if (!session?.user) redirect('/login');

  const tasks = await getTasks();
  return <TasksClient tasks={tasks} />;
}

