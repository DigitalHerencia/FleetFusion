import type { ReactNode } from "react";

import { Wordmark } from "@/components/brand/wordmark";

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/20">
      <header className="border-b bg-background px-6 py-4">
        <div className="mx-auto w-full max-w-6xl">
          <Wordmark />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
