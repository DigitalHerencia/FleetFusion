import { auth } from '@/lib/server/auth';

import { MembersTable } from '../components/MembersTable';
import { SettingsHeader } from '../components/SettingsHeader';
import { getOrgMembers } from '../lib/settingsFetchers';
import type { SettingsMember } from '../types';

export default async function OrganizationUsersPage() {
  const [memberRows, context] = await Promise.all([getOrgMembers(), auth.requireOrgContext()]);
  const members = memberRows as SettingsMember[];
  const canInvite = context.role?.toUpperCase() === 'OWNER';
  return (
    <section className="grid gap-5">
      <SettingsHeader
        title="Members and roles"
        description="Manage membership and least-privilege access for this organization."
      />
      <MembersTable members={members} canInvite={canInvite} />
    </section>
  );
}
