import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTasks, getCalendarNotes } from '@/app/actions';
import CalendarClient from '@/components/CalendarClient';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await getSession();
  if (!session?.user) redirect('/login');

  const tasks = await getTasks();
  const calendarNotes = await getCalendarNotes();
  return <CalendarClient tasks={tasks} calendarNotes={calendarNotes} />;
}

