'use client';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import type { Route } from 'next';
import Link from 'next/link';

export function UserMenu() {
  return (
    <div className="flex shrink-0 items-center justify-end">
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <Link
          className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
          href={'/sign-in' as Route}
        >
          Sign in
        </Link>
      </SignedOut>
    </div>
  );
}

export default UserMenu;
