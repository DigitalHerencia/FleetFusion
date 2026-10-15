import Link from 'next/link';

import type { IftaFuelPurchase } from '../types';

interface IftaFuelListProps {
  purchases: IftaFuelPurchase[];
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function IftaFuelList({ purchases }: IftaFuelListProps) {
  if (purchases.length === 0) {
    return (
      <section className="rounded-lg border border-dashed p-8 text-center">
        <h2 className="font-medium">No fuel purchases recorded</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Record each fuel purchase in the jurisdiction where the fuel was purchased.
        </p>
        <Link className="mt-4 inline-block text-sm font-medium underline" href="/ifta/fuel/new">
          Add a fuel purchase
        </Link>
      </section>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Purchase date</th>
            <th className="px-4 py-3 font-medium">Vehicle</th>
            <th className="px-4 py-3 font-medium">Jurisdiction</th>
            <th className="px-4 py-3 text-right font-medium">Gallons</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Vendor</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {purchases.map((purchase) => (
            <tr className="hover:bg-muted/30" key={purchase.id}>
              <td className="px-4 py-3">
                <Link
                  className="font-medium underline-offset-4 hover:underline"
                  href={`/ifta/fuel/${purchase.id}`}
                >
                  {formatDate(purchase.purchaseDate)}
                </Link>
              </td>
              <td className="px-4 py-3">{purchase.vehicle?.name ?? purchase.vehicleId}</td>
              <td className="px-4 py-3">{purchase.jurisdiction}</td>
              <td className="px-4 py-3 text-right">{purchase.gallons.toLocaleString()}</td>
              <td className="px-4 py-3 text-right">
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: purchase.currency || 'USD',
                }).format(purchase.amountCents / 100)}
              </td>
              <td className="px-4 py-3">{purchase.vendor || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
