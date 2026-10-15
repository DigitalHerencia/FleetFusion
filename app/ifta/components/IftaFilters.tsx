interface IftaFiltersProps {
  action?: string;
  search?: string;
  period?: string;
  year?: string;
}

export function IftaFilters({ action, search = '', period = '', year = '' }: IftaFiltersProps) {
  return (
    <form action={action} className="flex flex-wrap items-end gap-3" method="get">
      <label className="grid gap-1 text-sm">
        <span>Search</span>
        <input
          className="bg-background h-10 min-w-56 rounded-md border px-3"
          name="search"
          placeholder="Vehicle, trip, or vendor"
          type="search"
          defaultValue={search}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Quarter</span>
        <select
          className="bg-background h-10 min-w-44 rounded-md border px-3"
          name="quarter"
          defaultValue={period}
        >
          <option value="">All dates</option>
          <option value="Q1">Q1 (Jan–Mar)</option>
          <option value="Q2">Q2 (Apr–Jun)</option>
          <option value="Q3">Q3 (Jul–Sep)</option>
          <option value="Q4">Q4 (Oct–Dec)</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span>Year</span>
        <input
          className="bg-background h-10 w-28 rounded-md border px-3"
          max={new Date().getFullYear() + 1}
          min="2000"
          name="year"
          placeholder="All"
          type="number"
          defaultValue={year}
        />
      </label>
      <button
        className="hover:bg-muted h-10 rounded-md border px-4 text-sm font-medium"
        type="submit"
      >
        Apply filters
      </button>
      {(search || period || year) && (
        <a className="h-10 content-center px-2 text-sm underline" href={action ?? undefined}>
          Clear
        </a>
      )}
    </form>
  );
}
