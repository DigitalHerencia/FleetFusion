import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DispatchForm } from '../../components/DispatchForm';
import { getLoadById } from '../../lib/dispatchFetchers';

export default async function EditLoadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const load = await getLoadById({ id: slug });
  if (!load) notFound();
  return (
    <main className="domain-page">
      <p>
        <Link href={`/dispatch/${load.id}`}>← Load details</Link>
      </p>
      <h1>Edit {load.reference}</h1>
      <DispatchForm load={load} />
    </main>
  );
}
