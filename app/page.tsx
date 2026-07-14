import { getTasks, getSalahLogs, getCalendarNotes } from '@/app/actions';
import TodayClient from '@/components/TodayClient';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const tasks = await getTasks();
  const salahLogs = await getSalahLogs();
  const calendarNotes = await getCalendarNotes();

  return <TodayClient tasks={tasks} salahLogs={salahLogs} calendarNotes={calendarNotes} />;
}
