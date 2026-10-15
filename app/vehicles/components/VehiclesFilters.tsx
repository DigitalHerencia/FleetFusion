import Link from 'next/link';

interface VehiclesFiltersProps {
  search: string;
  status: string;
  type: string;
}

const vehicleStatuses = [
  ['ACTIVE', 'Active'],
  ['IN_SHOP', 'In shop'],
  ['OUT_OF_SERVICE', 'Out of service'],
  ['SOLD', 'Sold'],
  ['ARCHIVED', 'Archived'],
] as const;

const vehicleTypes = [
  ['TRACTOR', 'Tractor'],
  ['TRAILER', 'Trailer'],
  ['STRAIGHT_TRUCK', 'Straight truck'],
  ['SERVICE_VEHICLE', 'Service vehicle'],
  ['OTHER', 'Other'],
] as const;

export function VehiclesFilters({ search, status, type }: VehiclesFiltersProps) {
  return (
    <form action="/vehicles" className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-sm">
        Search
        <input
          className="border-input bg-background h-9 min-w-48 rounded-md border px-3"
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Name, VIN, make, or model"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Status
        <select
          className="border-input bg-background h-9 rounded-md border px-3"
          name="status"
          defaultValue={status}
        >
          <option value="">All statuses</option>
          {vehicleStatuses.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Type
        <select
          className="border-input bg-background h-9 rounded-md border px-3"
          name="type"
          defaultValue={type}
        >
          <option value="">All types</option>
          {vehicleTypes.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button
        className="bg-primary text-primary-foreground h-9 rounded-md px-4 text-sm"
        type="submit"
      >
        Apply filters
      </button>
      <Link className="text-muted-foreground h-9 content-center text-sm underline" href="/vehicles">
        Clear
      </Link>
    </form>
  );
}
