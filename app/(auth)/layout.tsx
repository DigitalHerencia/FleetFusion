import type { ReactNode } from "react";
import { AuthShell } from "@/components/shells/auth-shell";
import { getIdentity } from "@/lib/auth/auth";
import { redirectAfterAuth } from "@/lib/auth/redirects";

// Auth routes share a frame; Clerk behavior remains under lib/auth.
export default async function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  if (await getIdentity()) redirectAfterAuth();
  return <AuthShell>{children}</AuthShell>;
}
