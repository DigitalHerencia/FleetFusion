import type { ReactNode } from "react";

import { PublicFooter } from "@/components/nav/public-footer";
import { PublicHeader } from "@/components/nav/public-header";
import { PublicMobileBottomNav } from "@/components/nav/mobile-bottom-nav";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="min-w-0 flex-1 pb-16 md:pb-0">{children}</main>
      <PublicFooter />
      <PublicMobileBottomNav />
    </div>
  );
}
