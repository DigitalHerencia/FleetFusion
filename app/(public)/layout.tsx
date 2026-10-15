// app/(public)/layout.tsx

import type { ReactNode } from "react";

import { PublicShell } from "@/components/shells/public-shell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
