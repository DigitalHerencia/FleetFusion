import { createRole, deleteRole, updateRole } from '../lib/adminActions';
import type { getAllRoles } from '../lib/adminFetchers';

type Role = Awaited<ReturnType<typeof getAllRoles>>[number];

async function saveRole(formData: FormData) {
  'use server';
  await updateRole(formData);
}

async function removeRole(formData: FormData) {
  'use server';
  await deleteRole(formData);
}

async function addRole(formData: FormData) {
  'use server';
  await createRole(formData);
}

export function RolesTable({ roles }: { roles: Role[] }) {
  return (
    <div className="space-y-6">
      <form action={addRole} className="bg-card grid gap-3 rounded-lg border p-4 md:grid-cols-2">
        <h2 className="text-lg font-semibold md:col-span-2">Create role</h2>
        <label className="grid gap-1 text-sm">
          Name
          <input className="rounded-md border px-3 py-2" name="name" required />
        </label>
        <label className="grid gap-1 text-sm">
          Organization ID (blank for system role)
          <input className="rounded-md border px-3 py-2" name="organizationId" />
        </label>
        <label className="grid gap-1 text-sm">
          Description
          <input className="rounded-md border px-3 py-2" name="description" />
        </label>
        <label className="grid gap-1 text-sm">
          Permission keys (comma separated)
          <input
            className="rounded-md border px-3 py-2"
            name="permissions"
            placeholder="vehicles:read, loads:write"
          />
        </label>
        <button
          className="bg-primary text-primary-foreground w-fit rounded-md px-4 py-2 md:col-span-2"
          type="submit"
        >
          Create role
        </button>
      </form>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3">Role</th>
              <th className="p-3">Organization</th>
              <th className="p-3">Permissions</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr className="border-t align-top" key={role.id}>
                <td className="p-3">
                  <form action={saveRole} className="grid gap-2">
                    <input name="id" type="hidden" value={role.id} />
                    <input
                      aria-label="Role name"
                      className="rounded border px-2 py-1 font-medium"
                      name="name"
                      required
                      defaultValue={role.name}
                    />
                    <input
                      aria-label="Role description"
                      className="rounded border px-2 py-1"
                      name="description"
                      defaultValue={role.description ?? ''}
                    />
                    <input name="organizationId" type="hidden" value={role.organizationId ?? ''} />
                    <label className="grid gap-1 text-xs">
                      Permission keys
                      <input
                        aria-label="Permission keys"
                        className="rounded border px-2 py-1"
                        name="permissions"
                        defaultValue={role.permissions
                          .map((permission) => permission.permissionKey)
                          .join(',')}
                      />
                    </label>
                    <button className="text-primary w-fit underline" type="submit">
                      Save changes
                    </button>
                  </form>
                </td>
                <td className="p-3">{role.organization?.name ?? 'System-wide'}</td>
                <td className="max-w-sm p-3">
                  {role.permissions.map((permission) => (
                    <span
                      className="bg-muted mr-1 mb-1 inline-block rounded px-2 py-1 text-xs"
                      key={permission.id}
                    >
                      {permission.permissionKey}
                    </span>
                  ))}
                </td>
                <td className="p-3">
                  <form action={removeRole}>
                    <input name="id" type="hidden" value={role.id} />
                    <button className="text-destructive underline" type="submit">
                      Archive
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!roles.length && (
              <tr>
                <td className="text-muted-foreground p-6 text-center" colSpan={4}>
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
