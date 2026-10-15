import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { getIdentity } from "@/lib/auth/auth";
import { redirectToSignIn } from "@/lib/auth/redirects";

export default async function SetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await getIdentity())) redirectToSignIn();
  return (
    <main className="min-h-dvh bg-background px-4 py-6 text-foreground sm:px-8">
      <header className="mx-auto mb-10 max-w-lg">
        <Wordmark />
      </header>
      {children}
    </main>
  );
}
