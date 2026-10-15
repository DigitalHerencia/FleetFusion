function formatCell(value: unknown): string {
  if (value instanceof Date) return value.toLocaleString();
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function AnalyticsTableRenderer({
  rows,
  emptyMessage = 'No records to show.',
}: {
  rows: Array<Record<string, unknown>>;
  emptyMessage?: string;
}) {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))].slice(0, 8);
  if (!rows.length || !columns.length) {
    return (
      <p className="text-muted-foreground rounded-lg border p-6 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((column) => (
              <th className="p-3 capitalize" key={column}>
                {column.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr className="border-t" key={String(row['id'] ?? index)}>
              {columns.map((column) => (
                <td className="max-w-xs truncate p-3" key={column}>
                  {formatCell(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
