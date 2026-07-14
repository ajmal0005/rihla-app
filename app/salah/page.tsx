import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSalahLogs } from '@/app/actions';
import SalahClient from '@/components/SalahClient';

export const dynamic = 'force-dynamic';

export default async function SalahPage() {
  const session = await getSession();
  if (!session?.user) redirect('/login');

  const salahLogs = await getSalahLogs();
  return <SalahClient salahLogs={salahLogs} />;
}

