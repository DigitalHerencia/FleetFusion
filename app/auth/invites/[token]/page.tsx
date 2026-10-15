import Link from 'next/link';

import { InviteAcceptForm } from '../../components/InviteAcceptForm';
import { getInviteByToken } from '../../lib/authFetchers';

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await getInviteByToken(token);
  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-semibold">Join an organization</h1>
        {invitation?.valid ? (
          <p className="mt-2 text-slate-600">
            You are invited to join <strong>{invitation.organizationName}</strong> as{' '}
            {invitation.role.toLowerCase()}.
          </p>
        ) : (
          <p className="mt-2 text-slate-600">
            This invitation is invalid, expired, revoked, or has already been used.
          </p>
        )}
      </div>
      {invitation?.valid ? (
        <InviteAcceptForm token={token} email={invitation.email} />
      ) : (
        <Link href="/auth/sign-out" className="w-fit rounded-md border px-4 py-2">
          Return to account
        </Link>
      )}
    </section>
  );
}
