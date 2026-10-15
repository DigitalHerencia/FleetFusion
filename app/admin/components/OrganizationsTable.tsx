import { createOrganization, deleteOrganization, updateOrganization } from '../lib/adminActions';
import type { getAllOrganizations } from '../lib/adminFetchers';

type Organization = Awaited<ReturnType<typeof getAllOrganizations>>[number];

async function addOrganization(formData: FormData) {
  'use server';
  await createOrganization(formData);
}

async function saveOrganization(formData: FormData) {
  'use server';
  await updateOrganization(formData);
}

async function archiveOrganization(formData: FormData) {
  'use server';
  await deleteOrganization(formData);
}

export function OrganizationsTable({ organizations }: { organizations: Organization[] }) {
  return (
    <div className="space-y-6">
      <form
        action={addOrganization}
        className="bg-card grid gap-3 rounded-lg border p-4 md:grid-cols-2"
      >
        <h2 className="text-lg font-semibold md:col-span-2">Create organization</h2>
        <label className="grid gap-1 text-sm">
          Organization name
          <input className="rounded-md border px-3 py-2" name="name" required />
        </label>
        <label className="grid gap-1 text-sm">
          Slug
          <input className="rounded-md border px-3 py-2" name="slug" required />
        </label>
        <label className="grid gap-1 text-sm">
          Timezone
          <input
            className="rounded-md border px-3 py-2"
            name="timezone"
            defaultValue="America/Denver"
            required
          />
        </label>
        <label className="grid gap-1 text-sm">
          Owner user ID
          <input className="rounded-md border px-3 py-2" name="ownerUserId" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input defaultChecked name="isActive" type="checkbox" /> Active
        </label>
        <button
          className="bg-primary text-primary-foreground w-fit rounded-md px-4 py-2"
          type="submit"
        >
          Create organization
        </button>
      </form>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3">Organization</th>
              <th className="p-3">Status</th>
              <th className="p-3">Members</th>
              <th className="p-3">Fleet</th>
              <th className="p-3">Manage</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((organization) => (
              <tr className="border-t align-top" key={organization.id}>
                <td className="p-3">
                  <form action={saveOrganization} className="grid gap-2">
                    <input name="id" type="hidden" value={organization.id} />
                    <input
                      aria-label="Organization name"
                      className="rounded border px-2 py-1 font-medium"
                      name="name"
                      required
                      defaultValue={organization.name}
                    />
                    <input
                      aria-label="Organization slug"
                      className="rounded border px-2 py-1"
                      name="slug"
                      required
                      defaultValue={organization.slug}
                    />
                    <input
                      aria-label="Timezone"
                      className="rounded border px-2 py-1"
                      name="timezone"
                      defaultValue={organization.timezone}
                    />
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        defaultChecked={organization.isActive}
                        name="isActive"
                        type="checkbox"
                      />{' '}
                      Active
                    </label>
                    <button className="text-primary w-fit underline" type="submit">
                      Save
                    </button>
                  </form>
                </td>
                <td className="p-3">{organization.isActive ? 'Active' : 'Inactive'}</td>
                <td className="p-3">{organization._count.memberships}</td>
                <td className="p-3">
                  {organization._count.vehicles} vehicles · {organization._count.drivers} drivers ·{' '}
                  {organization._count.loads} loads
                </td>
                <td className="p-3">
                  <form action={archiveOrganization}>
                    <input name="id" type="hidden" value={organization.id} />
                    <button className="text-destructive underline" type="submit">
                      Deactivate
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!organizations.length && (
              <tr>
                <td className="text-muted-foreground p-6 text-center" colSpan={5}>
                  No organizations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
