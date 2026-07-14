import { getTasks, getCalendarNotes } from '@/app/actions';
import CalendarClient from '@/components/CalendarClient';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const tasks = await getTasks();
  const calendarNotes = await getCalendarNotes();
  return <CalendarClient tasks={tasks} calendarNotes={calendarNotes} />;
}
