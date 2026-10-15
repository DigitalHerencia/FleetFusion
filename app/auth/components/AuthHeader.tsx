import Link from 'next/link';

export function AuthHeader() {
  return (
    <header className="border-b bg-white">
      <nav
        aria-label="Account navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"
      >
        <Link href="/" className="font-semibold tracking-tight">
          FleetFusion
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/settings">Settings</Link>
          <Link href="/auth/sign-out">Sign out</Link>
        </div>
      </nav>
    </header>
  );
}
