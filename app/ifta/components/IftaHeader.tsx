import type { Route } from 'next';
import Link from 'next/link';

interface IftaHeaderProps {
  title?: string;
  description?: string;
  total?: number;
  createHref?: string;
  createLabel?: string;
}

export function IftaHeader({
  title = 'IFTA reporting',
  description = 'Track jurisdiction miles and fuel purchases for accurate quarterly fuel-tax reporting.',
  total,
  createHref,
  createLabel = 'Add record',
}: IftaHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          International Fuel Tax Agreement
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">{description}</p>
        {total !== undefined && (
          <p className="text-muted-foreground mt-2 text-sm">
            {total} {total === 1 ? 'record' : 'records'}
          </p>
        )}
      </div>
      {createHref && (
        <Link
          className="bg-primary text-primary-foreground inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
          href={createHref as Route}
        >
          {createLabel}
        </Link>
      )}
    </header>
  );
}
