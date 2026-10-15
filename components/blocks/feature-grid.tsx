import * as React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
export function FeatureContentGrid({
  id,
  title,
  introduction,
  items,
  closing,
  columns = 3,
  className,
}: {
  id?: string;
  title: string;
  introduction?: React.ReactNode;
  items: readonly { title: string; content: React.ReactNode }[];
  closing?: React.ReactNode;
  columns?: 3 | 4;
  className?: string;
}) {
  return (
    <section id={id} className={cn("px-6 py-16 sm:px-10 lg:px-12", className)}>
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-center text-3xl font-black tracking-tight uppercase">
          {title}
        </h2>

        {introduction && (
          <div className="mx-auto mb-8 max-w-3xl text-center leading-7">
            {introduction}
          </div>
        )}

        <div
          className={cn(
            "grid gap-6 md:grid-cols-2",
            columns === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3",
          )}
        >
          {items.map((item, index) => (
            <Card
              key={item.title}
              className="border-4 border-foreground bg-background shadow-[8px_8px_0_hsl(var(--primary))]"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center border border-muted bg-primary text-lg font-bold">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <CardTitle className="text-lg uppercase">
                    {item.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="leading-7 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5">
                {item.content}
              </CardContent>
            </Card>
          ))}
        </div>

        {closing && <div className="mt-8 text-center leading-7">{closing}</div>}
      </div>
    </section>
  );
}

export function FeatureEditorial({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-y border-muted/30 px-6 py-16 sm:px-10 lg:px-12",
        className,
      )}
    >
      <div className="mx-auto max-w-4xl">
        {title && (
          <h2 className="mb-8 text-3xl font-black tracking-tight uppercase sm:text-4xl">
            {title}
          </h2>
        )}
        <div className="text-lg leading-8 [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_h3]:mt-10 [&_h3]:text-xl [&_h3]:font-bold [&_p]:my-5 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </div>
    </section>
  );
}

const featureColors = [
  "bg-primary/10",
  "bg-secondary/10",
  "bg-accent/10",
  "bg-green-500/10",
  "bg-yellow-500/10",
  "bg-blue-500/10",
];

const iconColors = [
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-green-500",
  "bg-yellow-500",
  "bg-blue-500",
];

// ============================================================================
// FEATURE GRID VARIANT 1: With Icons
// ============================================================================
export interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface FeatureGridWithIconsProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features: FeatureItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeatureGridWithIcons({
  title,
  subtitle,
  description,
  features,
  columns = 3,
  className,
}: FeatureGridWithIconsProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-7xl">
        {(title || subtitle || description) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-primary uppercase">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={cn("grid gap-6", gridCols[columns])}>
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={cn(
                "group hover:-translate-x-1er:translate-y-[-4px] transition hover:shadow-[8px_8px_0px_hsl(var(--shadow-color))]",
                featureColors[index % 6],
              )}
            >
              <CardHeader>
                <div
                  className={cn(
                    "mb-4 flex h-14 w-14 items-center justify-center border-3 border-foreground shadow-[3px_3px_0px_hsl(var(--shadow-color))]",
                    iconColors[index % 6],
                  )}
                >
                  {feature.icon}
                </div>
                <CardTitle className="uppercase">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURE GRID VARIANT 2: With Images
// ============================================================================
export interface FeatureWithImageItem {
  image: string;
  title: string;
  description: string;
}

export interface FeatureGridWithImagesProps {
  title?: string;
  subtitle?: string;
  features: FeatureWithImageItem[];
  className?: string;
}

export function FeatureGridWithImages({
  title,
  subtitle,
  features,
  className,
}: FeatureGridWithImagesProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-7xl">
        {(title || subtitle) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && (
              <p className="text-sm font-bold tracking-widest text-secondary uppercase">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
                {title}
              </h2>
            )}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="group">
              <div className="mb-4 overflow-hidden border-3 border-foreground shadow-[6px_6px_0px_hsl(var(--shadow-color))] transition group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[8px_8px_0px_hsl(var(--shadow-color))]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  height={450}
                  unoptimized
                  width={800}
                  className="h-48 w-full object-cover"
                />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase">
                {feature.title}
              </h3>
              <p className="font-medium text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURE GRID VARIANT 3: Alternating
// ============================================================================
export interface FeatureAlternatingItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

export interface FeatureGridAlternatingProps {
  features: FeatureAlternatingItem[];
  className?: string;
}

export function FeatureGridAlternating({
  features,
  className,
}: FeatureGridAlternatingProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-6xl space-y-16">
        {features.map((feature, index) => {
          const isReversed = index % 2 === 1;

          return (
            <div
              key={feature.title}
              className={cn(
                "grid items-center gap-8 md:grid-cols-2 md:gap-12",
                isReversed && "md:[&>*:first-child]:order-2",
              )}
            >
              <div className="space-y-4">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center border-3 border-foreground shadow-hard",
                    iconColors[index % 6],
                  )}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black uppercase md:text-3xl">
                  {feature.title}
                </h3>
                <p className="text-lg font-medium text-muted-foreground">
                  {feature.description}
                </p>
              </div>

              <div className="relative">
                <div className="overflow-hidden border-3 border-foreground shadow-[8px_8px_0px_hsl(var(--shadow-color))]">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    height={450}
                    unoptimized
                    width={800}
                    className="h-auto w-full object-cover"
                  />
                </div>
                <div
                  className={cn(
                    "absolute -bottom-4 h-16 w-16 border-3 border-foreground",
                    isReversed ? "-right-4" : "-left-4",
                    featureColors[index % 6],
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================================
// FEATURE GRID VARIANT 4: Bento Grid
// ============================================================================
export interface BentoFeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  span?: "normal" | "wide" | "tall";
}

export interface FeatureBentoGridProps {
  title?: string;
  subtitle?: string;
  features: BentoFeatureItem[];
  className?: string;
}

export function FeatureBentoGrid({
  title,
  subtitle,
  features,
  className,
}: FeatureBentoGridProps) {
  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-7xl">
        {(title || subtitle) && (
          <div className="mb-12 space-y-4 text-center">
            {subtitle && (
              <p className="inline-block border-2 border-foreground bg-accent px-3 py-1 text-sm font-bold tracking-widest text-accent-foreground uppercase">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
                {title}
              </h2>
            )}
          </div>
        )}

        <div className="grid auto-rows-50 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const spanClass = {
              normal: "",
              wide: "md:col-span-2",
              tall: "md:row-span-2",
            }[feature.span || "normal"];

            return (
              <Card
                key={feature.title}
                className={cn(
                  "group flex flex-col overflow-hidden transition hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_hsl(var(--shadow-color))]",
                  featureColors[index % 6],
                  spanClass,
                )}
              >
                <CardHeader className="flex-1">
                  <div
                    className={cn(
                      "mb-4 flex h-12 w-12 items-center justify-center border-3 border-foreground shadow-[3px_3px_0px_hsl(var(--shadow-color))]",
                      iconColors[index % 6],
                    )}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg uppercase">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Export all variants
// ============================================================================
export const FeatureGrid = {
  WithIcons: FeatureGridWithIcons,
  WithImages: FeatureGridWithImages,
  Alternating: FeatureGridAlternating,
  Bento: FeatureBentoGrid,
};
