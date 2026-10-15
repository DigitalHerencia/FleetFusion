import "server-only";

import { assertPermission } from "../authz/permissions";
import { getProviderStatuses } from "../integrations/status";
import { withAuthenticatedRead } from "../db/tenant";

export async function getIntegrationStatuses() {
  return withAuthenticatedRead(async (_tx, access) => {
    assertPermission(access, "organization:read");
    return getProviderStatuses();
  });
}
