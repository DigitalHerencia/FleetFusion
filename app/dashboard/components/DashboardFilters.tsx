export function DashboardFilters({
  from,
  to,
}: {
  from?: string | undefined;
  to?: string | undefined;
}) {
  return (
    <form action="/dashboard" method="get" className="domain-filters">
      <label>
        From
        <input type="date" name="from" defaultValue={from} />
      </label>
      <label>
        To
        <input type="date" name="to" defaultValue={to} />
      </label>
      <button>Apply date range</button>
    </form>
  );
}

export default DashboardFilters;
