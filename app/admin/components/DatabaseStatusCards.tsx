type Snapshot = {
  organizations: number;
  activeOrganizations: number;
  roles: number;
  documents: number;
  pendingMemberships: number;
  database: { status: 'online' | 'unavailable'; latencyMs: number | null };
};

export function DatabaseStatusCards({ snapshot }: { snapshot: Snapshot }) {
  const cards = [
    {
      label: 'Organizations',
      value: snapshot.organizations,
      detail: `${snapshot.activeOrganizations} active`,
    },
    { label: 'Roles', value: snapshot.roles, detail: 'System and organization roles' },
    { label: 'System documents', value: snapshot.documents, detail: 'Published records' },
    {
      label: 'Pending memberships',
      value: snapshot.pendingMemberships,
      detail: 'Awaiting activation',
    },
  ];
  return (
    <section aria-label="System status" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <article className="bg-card rounded-lg border p-5 shadow-sm" key={card.label}>
          <p className="text-muted-foreground text-sm">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{card.value.toLocaleString()}</p>
          <p className="text-muted-foreground mt-1 text-xs">{card.detail}</p>
        </article>
      ))}
      <article className="bg-card rounded-lg border p-5 shadow-sm sm:col-span-2 lg:col-span-4">
        <h2 className="font-medium">Database connectivity</h2>
        <p className="mt-2 text-sm">
          <span
            className={`mr-2 inline-block size-2 rounded-full ${snapshot.database.status === 'online' ? 'bg-emerald-500' : 'bg-destructive'}`}
          />
          {snapshot.database.status === 'online' ? 'Connected' : 'Unavailable'}
          {snapshot.database.latencyMs !== null && ` · ${snapshot.database.latencyMs} ms`}
        </p>
      </article>
    </section>
  );
}
