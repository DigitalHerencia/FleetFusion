export function DriversFilters({
  status = '',
  search = '',
}: {
  status?: string | undefined;
  search?: string | undefined;
}) {
  return (
    <form className="domain-filters" action="/drivers" method="get">
      <label>
        Search
        <input name="search" defaultValue={search} placeholder="Name, email, license" />
      </label>
      <label>
        Status
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <button>Apply filters</button>
    </form>
  );
}

export default DriversFilters;
