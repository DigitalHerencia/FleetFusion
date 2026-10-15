import React from 'react';

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-[50vh] flex-1 items-center justify-center px-6 py-16"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          aria-hidden="true"
          className="border-primary/25 border-t-primary h-10 w-10 animate-spin rounded-full border-4"
        />
        <p className="text-muted-foreground text-sm">Loading FleetFusion…</p>
      </div>
    </main>
  );
}
