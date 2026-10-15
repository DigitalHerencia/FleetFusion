'use client';

import { type FormEvent, useState } from 'react';

import { inviteMember, updateMemberRole } from '../lib/settingsActions';
import { useSettingsAction } from '../lib/settingsHooks';
import type { SettingsMember } from '../types';

const roles = [
  ['ADMIN', 'Administrator'],
  ['MANAGER', 'Manager'],
  ['DISPATCHER', 'Dispatcher'],
  ['DRIVER_MANAGER', 'Driver manager'],
  ['COMPLIANCE_MANAGER', 'Compliance manager'],
  ['ANALYST', 'Analyst'],
  ['BILLING', 'Billing'],
  ['MEMBER', 'Member'],
] as const;

export function MembersTable({
  members,
  canInvite = false,
}: {
  members: SettingsMember[];
  canInvite?: boolean;
}) {
  const roleAction = useSettingsAction(updateMemberRole);
  const inviteAction = useSettingsAction(inviteMember);
  const [roleValues, setRoleValues] = useState<Record<string, string>>({});
  const [inviteMessage, setInviteMessage] = useState('');

  function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    inviteAction.execute({ email: data.get('email'), role: data.get('role') });
    setInviteMessage('');
  }

  return (
    <div className="grid gap-5">
      {canInvite ? (
        <form
          onSubmit={submitInvite}
          className="grid gap-3 rounded-xl border bg-white p-5 sm:grid-cols-[1fr_12rem_auto]"
        >
          <label className="grid gap-1 text-sm font-medium">
            Invite by email
            <input
              name="email"
              type="email"
              required
              maxLength={320}
              className="rounded-md border px-3 py-2 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Role
            <select
              name="role"
              defaultValue="member"
              className="rounded-md border px-3 py-2 font-normal"
            >
              {roles.map(([value, label]) => (
                <option key={value} value={value.toLowerCase()}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={inviteAction.isPending}
            className="self-end rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
            type="submit"
          >
            {inviteAction.isPending ? 'Sending…' : 'Invite'}
          </button>
          <p aria-live="polite" className="text-sm text-red-700 sm:col-span-3">
            {inviteAction.error || inviteMessage}
          </p>
          {inviteAction.result ? (
            <p className="text-sm text-emerald-700 sm:col-span-3">
              Invitation created:{' '}
              <a className="break-all underline" href={inviteAction.result.inviteUrl}>
                {inviteAction.result.inviteUrl}
              </a>
            </p>
          ) : null}
        </form>
      ) : null}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((member) => {
              const role = roleValues[member.id] ?? member.role;
              return (
                <tr key={member.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {[member.user.firstName, member.user.lastName].filter(Boolean).join(' ') ||
                        member.user.email ||
                        'Unnamed member'}
                    </p>
                    <p className="text-slate-500">{member.user.email}</p>
                  </td>
                  <td className="px-4 py-3">{member.status.toLowerCase()}</td>
                  <td className="px-4 py-3">
                    {member.role === 'OWNER' ? (
                      <span>Owner</span>
                    ) : (
                      <select
                        aria-label={`Role for ${member.user.email ?? member.id}`}
                        value={role}
                        onChange={(event) =>
                          setRoleValues((values) => ({
                            ...values,
                            [member.id]: event.target.value,
                          }))
                        }
                        className="rounded-md border px-2 py-1"
                      >
                        {roles.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {member.role === 'OWNER' ? (
                      <span className="text-slate-500">Protected</span>
                    ) : (
                      <button
                        type="button"
                        disabled={roleAction.isPending || role === member.role}
                        onClick={() => roleAction.execute({ membershipId: member.id, role })}
                        className="underline disabled:no-underline disabled:opacity-50"
                      >
                        Save role
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!members.length ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={4}>
                  No organization members found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <p aria-live="polite" className="px-4 py-3 text-sm text-red-700">
          {roleAction.error}
        </p>
      </div>
    </div>
  );
}
