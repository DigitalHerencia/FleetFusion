import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const statCardVariants = cva("relative overflow-hidden", {
  variants: {
    variant: {
      default: "",
      compact: "[&_.stat-content]:p-4",
      large: "md:col-span-2",
    },
    colorScheme: {
      primary: "[&_.stat-bg]:bg-primary [&_.stat-icon]:bg-primary",
      secondary: "[&_.stat-bg]:bg-secondary [&_.stat-icon]:bg-secondary",
      accent: "[&_.stat-bg]:bg-accent [&_.stat-icon]:bg-accent",
      success: "[&_.stat-bg]:bg-success [&_.stat-icon]:bg-success",
      warning: "[&_.stat-bg]:bg-warning [&_.stat-icon]:bg-warning",
      info: "[&_.stat-bg]:bg-info [&_.stat-icon]:bg-info",
      destructive: "[&_.stat-bg]:bg-destructive [&_.stat-icon]:bg-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
    colorScheme: "primary",
  },
});

export interface StatCardProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "color">,
    VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  progress?: { value: number; label?: string };
  comparison?: string;
  /** @deprecated Use colorScheme instead */
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "info"
    | "destructive";
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      variant,
      colorScheme,
      color,
      title,
      value,
      change,
      trend = "neutral",
      icon,
      progress,
      comparison = "vs last month",
      ...props
    },
    ref,
  ) => {
    // Support legacy color prop
    const resolvedColorScheme = colorScheme ?? color ?? "primary";

    const TrendIcon =
      trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    const trendColor =
      trend === "up"
        ? "text-success"
        : trend === "down"
          ? "text-destructive"
          : "text-muted-foreground";

    return (
      <Card
        ref={ref}
        className={cn(
          statCardVariants({ variant, colorScheme: resolvedColorScheme }),
          className,
        )}
        {...props}
      >
        {/* Decorative background element */}
        <div className="stat-bg absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rotate-12 opacity-20" />

        <CardContent className="stat-content p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-bold tracking-wide text-muted-foreground uppercase">
                {title}
              </p>
              <p className="text-3xl font-black">{value}</p>
              {change && (
                <div className={cn("mt-2 flex items-center gap-1", trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-sm font-bold">{change}</span>
                  <span className="text-sm text-muted-foreground">
                    {comparison}
                  </span>
                </div>
              )}
            </div>
            {icon && (
              <div className="stat-icon flex h-12 w-12 items-center justify-center border-3 border-foreground text-foreground shadow-[3px_3px_0px_hsl(var(--shadow-color))]">
                {icon}
              </div>
            )}
          </div>

          {/* Progress section */}
          {progress && (
            <div className="mt-4 border-t-2 border-foreground/10 pt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {progress.label || "Progress"}
                </span>
                <span className="font-bold">{progress.value}%</span>
              </div>
              <Progress value={progress.value} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);
StatCard.displayName = "StatCard";

export { StatCard, statCardVariants };
