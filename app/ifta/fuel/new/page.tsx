import Link from 'next/link';

import { getVehicles } from '@/vehicles/lib/vehiclesFetchers';

import { IftaFuelForm } from '../../components/IftaFuelForm';
import { IftaHeader } from '../../components/IftaHeader';

export default async function NewIftaFuelPurchasePage() {
  const vehicles = await getVehicles({ page: 1, pageSize: 100 });

  return (
    <main className="space-y-6 p-6">
      <IftaHeader
        description="Record the date, jurisdiction, gallons, and amount shown on the fuel receipt."
        title="Record a fuel purchase"
      />
      <IftaFuelForm vehicles={vehicles.map(({ id, name }) => ({ id, name: name ?? id }))} />
      <Link className="text-sm underline" href="/ifta/fuel">
        Cancel and return to fuel purchases
      </Link>
    </main>
  );
}
