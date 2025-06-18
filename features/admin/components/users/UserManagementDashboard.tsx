import { listOrganizationUsers } from '@/lib/fetchers/userFetchers';
import { UserTable } from '@/components/admin/users/UserTable';
import { InviteUserForm } from '@/components/admin/users/InviteUserForm';

export default async function UserManagementDashboard({
  orgId,
}: {
  orgId: string;
}) {
  const users = await listOrganizationUsers(orgId);
  // Extract roles from users if needed
  const roles = users.map(user => user.role); // adjust property as needed
  return (
    <div>
      <UserTable users={users} />
      <InviteUserForm onInvite={() => {}} />
    </div>
  );
}
