import { getSalahLogs } from '@/app/actions';
import SalahClient from '@/components/SalahClient';

export const dynamic = 'force-dynamic';

export default async function SalahPage() {
  const salahLogs = await getSalahLogs();
  return <SalahClient salahLogs={salahLogs} />;
}
