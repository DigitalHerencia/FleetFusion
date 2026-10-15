import Link from 'next/link';

import { getLoadHistory } from '../lib/dispatchFetchers';

export default async function DispatchLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ loadId?: string }>;
}) {
  const { loadId } = await searchParams;
  const events = loadId ? await getLoadHistory({ id: loadId }) : [];
  return (
    <main className="domain-page">
      <p>
        <Link href="/dispatch">← Dispatch board</Link>
      </p>
      <h1>Load activity</h1>
      <form action="/dispatch/logs" method="get">
        <label>
          Load ID
          <input name="loadId" defaultValue={loadId} required />
        </label>
        <button>View history</button>
      </form>
      {!loadId && <p>Enter a load ID to view its status history.</p>}
      {loadId &&
        events.map((event) => (
          <article key={event.id}>
            <time dateTime={event.occurredAt.toISOString()}>
              {event.occurredAt.toLocaleString()}
            </time>
            <p>{event.status.replaceAll('_', ' ')}</p>
            {event.notes && <p>{event.notes}</p>}
          </article>
        ))}
      {loadId && !events.length && <p>No history found for this load.</p>}
    </main>
  );
}
