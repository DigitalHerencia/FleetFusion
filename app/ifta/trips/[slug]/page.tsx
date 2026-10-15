import { notFound } from 'next/navigation';

import { IftaDetailClient } from '../../components/IftaDetailClient';
import { getTripById } from '../../lib/iftaFetchers';
import type { IftaTrip } from '../../types';

interface IftaTripDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function IftaTripDetailPage({ params }: IftaTripDetailPageProps) {
  const { slug } = await params;
  const fetchTrip = getTripById as unknown as (input: { id: string }) => Promise<IftaTrip | null>;
  const trip = await fetchTrip({ id: slug });
  if (!trip) notFound();

  return (
    <main className="space-y-6 p-6">
      <IftaDetailClient kind="trip" record={trip} />
    </main>
  );
}
