import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface BentoItem {
  title: string;
  description?: string;
  icon?: ReactNode;
  span?: "large" | "tall" | "wide" | "normal";
  accent?: "primary" | "secondary" | "accent" | "card";
}

export interface BentoGridProps {
  title?: string;
  subtitle?: string;
  items: BentoItem[];
  className?: string;
}

const spanClass: Record<NonNullable<BentoItem["span"]>, string> = {
  large: "md:col-span-2 md:row-span-2",
  tall: "md:row-span-2",
  wide: "md:col-span-2",
  normal: "",
};

const accentClass: Record<NonNullable<BentoItem["accent"]>, string> = {
  primary: "bg-primary/15",
  secondary: "bg-secondary/15",
  accent: "bg-accent/15",
  card: "bg-card",
};

export function BentoGrid({
  title,
  subtitle,
  items,
  className,
}: BentoGridProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="mb-12 space-y-3 text-center">
            {title && (
              <h2 className="text-4xl font-black tracking-tight uppercase md:text-5xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mx-auto max-w-xl text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="grid auto-rows-[minmax(140px,auto)] grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className={cn(
                "flex flex-col justify-between border-3 border-foreground p-5 shadow-[4px_4px_0px_hsl(var(--shadow-color))] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_hsl(var(--shadow-color))]",
                spanClass[item.span ?? "normal"],
                accentClass[item.accent ?? "card"],
              )}
            >
              {item.icon && (
                <div className="mb-4 flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background">
                  {item.icon}
                </div>
              )}
              <div>
                <h3 className="text-lg font-black tracking-wide uppercase">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
