const separator = ":";

function joinTag(...parts: Array<string | number>) {
  return parts.join(separator);
}

export const cacheTags = {
  organization: (organizationId: string) =>
    joinTag("organization", organizationId),
  collection: (organizationId: string, resource: string) =>
    joinTag("organization", organizationId, resource),
  record: (organizationId: string, resource: string, recordId: string) =>
    joinTag("organization", organizationId, resource, recordId),
  user: (userId: string) => joinTag("user", userId),
} as const;
