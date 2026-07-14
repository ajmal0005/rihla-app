import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getNotes } from '@/app/actions';
import NotesClient from '@/components/NotesClient';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const session = await getSession();
  if (!session?.user) redirect('/login');

  const notes = await getNotes();
  return <NotesClient notes={notes} />;
}

