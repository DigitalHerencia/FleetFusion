import { IftaFilters } from '../components/IftaFilters';
import { IftaFuelList } from '../components/IftaFuelList';
import { IftaHeader } from '../components/IftaHeader';
import { IftaMobile } from '../components/IftaMobile';
import { listFuelPurchases } from '../lib/iftaFetchers';
import type { IftaFuelPurchase } from '../types';

interface IftaFuelPageProps {
  searchParams: Promise<{ search?: string; quarter?: string; year?: string }>;
}

function matchesQuarter(value: Date | string, quarter: string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return `Q${Math.floor(date.getUTCMonth() / 3) + 1}` === quarter;
}

export default async function IftaFuelPage({ searchParams }: IftaFuelPageProps) {
  const [purchases, filters] = await Promise.all([listFuelPurchases(), searchParams]);
  const search = filters.search?.trim().toLocaleLowerCase() ?? '';
  const quarter = filters.quarter ?? '';
  const year = Number(filters.year);
  const yearFilter = Number.isInteger(year) && year >= 2000 ? year : undefined;
  const filteredPurchases = (purchases as IftaFuelPurchase[])
    .filter((purchase) => {
      const textMatch =
        !search ||
        [purchase.vehicle?.name, purchase.vehicleId, purchase.vendor, purchase.jurisdiction]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase().includes(search));
      const quarterMatch = !quarter || matchesQuarter(purchase.purchaseDate, quarter);
      const yearMatch =
        yearFilter === undefined || new Date(purchase.purchaseDate).getUTCFullYear() === yearFilter;
      return textMatch && quarterMatch && yearMatch;
    })
    .sort(
      (left, right) =>
        new Date(right.purchaseDate).getTime() - new Date(left.purchaseDate).getTime(),
    );

  return (
    <main className="space-y-6 p-6">
      <IftaMobile />
      <IftaHeader
        createHref="/ifta/fuel/new"
        createLabel="Record purchase"
        description="Record purchased gallons and the jurisdiction of purchase for each receipt."
        title="IFTA fuel purchases"
        total={filteredPurchases.length}
      />
      <IftaFilters
        action="/ifta/fuel"
        period={quarter}
        search={filters.search ?? ''}
        year={filters.year ?? ''}
      />
      <IftaFuelList purchases={filteredPurchases} />
    </main>
  );
}
