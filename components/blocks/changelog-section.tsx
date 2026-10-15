import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

export type ChangelogTag = "feature" | "fix" | "improvement" | "breaking";

export interface ChangelogEntry {
  version: string;
  date: string;
  tag?: ChangelogTag;
  title: string;
  items: string[];
}

export interface ChangelogSectionProps {
  title?: string;
  subtitle?: string;
  entries: ChangelogEntry[];
  className?: string;
}

const tagVariant: Record<
  ChangelogTag,
  "default" | "secondary" | "success" | "destructive"
> = {
  feature: "default",
  improvement: "secondary",
  fix: "success",
  breaking: "destructive",
};

export function ChangelogSection({
  title = "Changelog",
  subtitle,
  entries,
  className,
}: ChangelogSectionProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 space-y-3">
          <h2 className="text-4xl font-black tracking-tight uppercase md:text-5xl">
            {title}
          </h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        <ol className="relative space-y-10 border-l-3 border-foreground pl-8">
          {entries.map((entry) => (
            <li key={entry.version} className="relative">
              <span className="absolute -left-[41px] flex h-5 w-5 items-center justify-center border-3 border-foreground bg-primary shadow-[2px_2px_0px_hsl(var(--shadow-color))]" />
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xl font-black tracking-wide uppercase">
                  {entry.version}
                </span>
                {entry.tag && (
                  <Badge variant={tagVariant[entry.tag]}>{entry.tag}</Badge>
                )}
                <span className="text-sm font-bold text-muted-foreground">
                  {entry.date}
                </span>
              </div>
              <h3 className="mt-2 font-bold">{entry.title}</h3>
              <ul className="mt-2 space-y-1.5">
                {entry.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
