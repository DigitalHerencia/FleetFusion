import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getVehicles } from '@/vehicles/lib/vehiclesFetchers';

import { IftaFuelForm } from '../../../components/IftaFuelForm';
import { IftaHeader } from '../../../components/IftaHeader';
import { listFuelPurchases } from '../../../lib/iftaFetchers';
import type { IftaFuelPurchase } from '../../../types';

interface EditIftaFuelPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditIftaFuelPage({ params }: EditIftaFuelPageProps) {
  const [{ slug }, purchases, vehicles] = await Promise.all([
    params,
    listFuelPurchases(),
    getVehicles({ page: 1, pageSize: 100 }),
  ]);
  const purchase = (purchases as IftaFuelPurchase[]).find((item) => item.id === slug);
  if (!purchase) notFound();

  const options = vehicles.map(({ id, name }) => ({ id, name: name ?? id }));
  if (!options.some((vehicle) => vehicle.id === purchase.vehicleId)) {
    options.push({ id: purchase.vehicleId, name: purchase.vehicle?.name ?? purchase.vehicleId });
  }

  return (
    <main className="space-y-6 p-6">
      <IftaHeader
        description="Correct purchase details to keep jurisdiction credit records accurate."
        title="Edit fuel purchase"
      />
      <IftaFuelForm initialData={purchase} vehicles={options} />
      <Link className="text-sm underline" href={`/ifta/fuel/${purchase.id}`}>
        Cancel and return to purchase
      </Link>
    </main>
  );
}
