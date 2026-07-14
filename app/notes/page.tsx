import { getNotes } from '@/app/actions';
import NotesClient from '@/components/NotesClient';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const notes = await getNotes();
  return <NotesClient notes={notes} />;
}
