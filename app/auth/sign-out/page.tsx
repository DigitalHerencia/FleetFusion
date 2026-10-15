'use client';

import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignOutPage() {
  return (
    <section className="mx-auto grid max-w-lg gap-4 rounded-xl border bg-white p-6 text-center shadow-sm">
      <h1 className="text-2xl font-semibold">Sign out of FleetFusion?</h1>
      <p className="text-slate-600">You can sign back in any time.</p>
      <div className="flex justify-center gap-3">
        <SignOutButton redirectUrl="/sign-in">
          <button type="button" className="rounded-md bg-slate-900 px-4 py-2 text-white">
            Sign out
          </button>
        </SignOutButton>
        <Link href="/settings" className="rounded-md border px-4 py-2">
          Cancel
        </Link>
      </div>
    </section>
  );
}
