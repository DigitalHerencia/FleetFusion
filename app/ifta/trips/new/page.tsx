import Link from 'next/link';

import { getVehicles } from '@/vehicles/lib/vehiclesFetchers';

import { IftaHeader } from '../../components/IftaHeader';
import { IftaTripForm } from '../../components/IftaTripForm';

export default async function NewIftaTripPage() {
  const vehicles = await getVehicles({ page: 1, pageSize: 100 });

  return (
    <main className="space-y-6 p-6">
      <IftaHeader
        description="Enter trip dates, total miles, and the miles traveled in each IFTA jurisdiction."
        title="Record an IFTA trip"
      />
      <IftaTripForm vehicles={vehicles.map(({ id, name }) => ({ id, name: name ?? id }))} />
      <Link className="text-sm underline" href="/ifta/trips">
        Cancel and return to trips
      </Link>
    </main>
  );
}
