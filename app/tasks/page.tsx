import { getTasks } from '@/app/actions';
import TasksClient from '@/components/TasksClient';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const tasks = await getTasks();
  return <TasksClient tasks={tasks} />;
}
