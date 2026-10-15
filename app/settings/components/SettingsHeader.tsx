import Link from 'next/link';

export function SettingsHeader({
  title = 'Settings',
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{title}</h1>
          {description ? <p className="mt-2 text-slate-600">{description}</p> : null}
        </div>
        <Link href="/auth/invites" className="rounded-md border px-3 py-2 text-sm">
          Invitations
        </Link>
      </div>
    </header>
  );
}
