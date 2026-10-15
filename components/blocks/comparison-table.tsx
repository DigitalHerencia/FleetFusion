import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ComparisonRow {
  feature: string;
  values: (string | boolean)[];
}

export interface ComparisonTableProps {
  title?: string;
  subtitle?: string;
  columns: string[];
  rows: ComparisonRow[];
  /** Zero-based index of the emphasized column. */
  highlightColumn?: number;
  className?: string;
  headerClassName?: string;
  tableClassName?: string;
  footer?: ReactNode;
}

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex size-6 items-center justify-center border-2 border-foreground bg-success">
        <Check className="size-3.5 text-success-foreground" />
        <span className="sr-only">Included</span>
      </span>
    ) : (
      <span className="inline-flex size-6 items-center justify-center border-2 border-foreground bg-muted">
        <X className="size-3.5 text-muted-foreground" />
        <span className="sr-only">Not included</span>
      </span>
    );
  }

  return <span className="text-sm leading-6 font-semibold">{value}</span>;
}

export function ComparisonTable({
  title = "Compare plans",
  subtitle,
  columns,
  rows,
  highlightColumn,
  className,
  headerClassName,
  tableClassName,
  footer,
}: ComparisonTableProps) {
  return (
    <section className={cn("px-6 py-20 sm:px-10 lg:px-12", className)}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="overflow-x-auto border-2 border-foreground shadow-[8px_8px_0_hsl(var(--background))]">
          <table className={cn("w-full border-collapse", tableClassName)}>
            <thead>
              <tr
                className={cn(
                  "border-b-2 border-foreground bg-muted",
                  headerClassName,
                )}
              >
                <th
                  scope="col"
                  className="w-32 px-5 py-3 text-left text-lg font-black tracking-wider uppercase"
                >
                  Metric
                </th>

                {columns.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn(
                      "px-5 py-3 text-left text-lg font-black tracking-wider uppercase",
                      index === highlightColumn &&
                        "bg-primary text-primary-foreground",
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-foreground/30 last:border-b-0"
                >
                  <th
                    scope="row"
                    className="px-5 py-4 text-left text-sm font-black uppercase"
                  >
                    {row.feature}
                  </th>

                  {row.values.map((value, index) => (
                    <td
                      key={index}
                      className={cn(
                        "px-5 py-4 text-left align-top",
                        index === highlightColumn && "bg-primary/10",
                      )}
                    >
                      <Cell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {footer && (
          <div className="mt-8 text-center leading-7 [&_p]:my-3">{footer}</div>
        )}
      </div>
    </section>
  );
}
