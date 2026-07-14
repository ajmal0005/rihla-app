import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTasks, getSalahLogs, getCalendarNotes } from '@/app/actions';
import TodayClient from '@/components/TodayClient';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const session = await getSession();
  if (!session?.user) redirect('/login');

  const tasks = await getTasks();
  const salahLogs = await getSalahLogs();
  const calendarNotes = await getCalendarNotes();

  return <TodayClient tasks={tasks} salahLogs={salahLogs} calendarNotes={calendarNotes} />;
}

