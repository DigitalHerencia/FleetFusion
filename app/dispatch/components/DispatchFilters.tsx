export function DispatchFilters({
  status = '',
  search = '',
}: {
  status?: string | undefined;
  search?: string | undefined;
}) {
  return (
    <form className="domain-filters" action="/dispatch" method="get">
      <label>
        Search loads
        <input name="search" defaultValue={search} placeholder="Reference or city" />
      </label>
      <label>
        Status
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {[
            'DRAFT',
            'PLANNED',
            'ASSIGNED',
            'AT_PICKUP',
            'IN_TRANSIT',
            'AT_DROPOFF',
            'DELIVERED',
            'CANCELED',
          ].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <button type="submit">Apply filters</button>
    </form>
  );
}

export default DispatchFilters;
