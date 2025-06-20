import type React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      <main className="flex flex-1 flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
}
