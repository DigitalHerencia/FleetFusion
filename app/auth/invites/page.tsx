import Link from 'next/link';

import { InviteForm } from '../components/InviteForm';
import { revokeInvite } from '../lib/authActions';
import { getPendingInvitesForOrg } from '../lib/authFetchers';

export default async function InvitesPage() {
  const invites = await getPendingInvitesForOrg();
  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Organization invitations</h1>
        <p className="mt-2 text-slate-600">
          Invite teammates to join this organization. Invitations expire after seven days.
        </p>
      </div>
      <InviteForm />
      <div className="overflow-hidden rounded-xl border bg-white">
        <h2 className="border-b px-5 py-4 text-lg font-medium">Pending invitations</h2>
        {invites.length ? (
          <ul className="divide-y">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium">{invite.email}</p>
                  <p className="text-sm text-slate-500">
                    {invite.role} · expires {new Date(invite.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <form
                  action={async () => {
                    'use server';
                    await revokeInvite({ id: invite.id });
                  }}
                >
                  <button type="submit" className="text-sm font-medium text-red-700 underline">
                    Revoke invitation
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-slate-500">There are no pending invitations.</p>
        )}
      </div>
      <Link className="text-sm underline" href="/settings/users">
        Manage organization members
      </Link>
    </section>
  );
}
