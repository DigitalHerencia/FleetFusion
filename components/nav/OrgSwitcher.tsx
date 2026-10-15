'use client';

export type OrganizationOption = {
  id: string;
  name: string;
};

type OrgSwitcherProps = {
  organizations: readonly OrganizationOption[];
  currentOrganizationId: string;
  onOrganizationChange: (organizationId: string) => void;
};

export function OrgSwitcher({
  organizations,
  currentOrganizationId,
  onOrganizationChange,
}: OrgSwitcherProps) {
  const currentOrganizationIsAvailable = organizations.some(
    (organization) => organization.id === currentOrganizationId,
  );

  if (organizations.length === 0 || !currentOrganizationIsAvailable) {
    return null;
  }

  return (
    <label className="flex min-w-0 items-center gap-2">
      <span className="sr-only">Current organization</span>
      <select
        aria-label="Current organization"
        className="border-input bg-background max-w-44 rounded-md border px-3 py-2 text-sm"
        value={currentOrganizationId}
        onChange={(event) => onOrganizationChange(event.currentTarget.value)}
      >
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default OrgSwitcher;
