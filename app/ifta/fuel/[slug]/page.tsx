import { notFound } from 'next/navigation';

import { IftaDetailClient } from '../../components/IftaDetailClient';
import { listFuelPurchases } from '../../lib/iftaFetchers';
import type { IftaFuelPurchase } from '../../types';

interface IftaFuelDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function IftaFuelDetailPage({ params }: IftaFuelDetailPageProps) {
  const [{ slug }, purchases] = await Promise.all([params, listFuelPurchases()]);
  const purchase = (purchases as IftaFuelPurchase[]).find((item) => item.id === slug);
  if (!purchase) notFound();

  return (
    <main className="space-y-6 p-6">
      <IftaDetailClient kind="fuel" record={purchase} />
    </main>
  );
}
