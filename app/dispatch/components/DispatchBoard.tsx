import type { Load } from '@prisma/client';

import { DispatchCard } from './DispatchCard';

type BoardData = {
  columns: Array<{ status: string; loads: Load[] }>;
};

export function DispatchBoard({ data }: { data: BoardData }) {
  return (
    <section className="dispatch-board" aria-label="Loads by status">
      {data.columns.map((column) => (
        <section className="dispatch-column" key={column.status}>
          <h2>
            {column.status.replaceAll('_', ' ')} <span>{column.loads.length}</span>
          </h2>
          {column.loads.length ? (
            column.loads.map((load) => <DispatchCard key={load.id} load={load} />)
          ) : (
            <p>No loads in this stage.</p>
          )}
        </section>
      ))}
    </section>
  );
}

export default DispatchBoard;
