'use client';

import Link from 'next/link';

export function AuthMobile() {
  return (
    <nav
      aria-label="Mobile account navigation"
      className="flex gap-4 overflow-x-auto border-b px-5 py-3 text-sm md:hidden"
    >
      <Link href="/auth/onboarding">Onboarding</Link>
      <Link href="/auth/invites">Invitations</Link>
      <Link href="/settings">Settings</Link>
    </nav>
  );
}
