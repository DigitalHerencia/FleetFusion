"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ErrorBlock({
  title,
  description = "The requested surface is unavailable.",
  onRetry,
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center px-6 py-12">
      <section className="w-full max-w-lg space-y-5 border-3 border-foreground bg-card p-8 text-center shadow-[8px_8px_0px_hsl(var(--shadow-color))]">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Request boundary
        </p>
        <h1 className="text-3xl font-black uppercase">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
          <Button asChild variant="outline">
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
