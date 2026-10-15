import "server-only";

import { assertPermission } from "../authz/permissions";
import { toLoadSummaryDTO } from "../db/dto/dispatch.dto";
import { loadSummarySelect } from "../db/selects/dispatch.selects";
import { withAuthenticatedRead } from "../db/tenant";

export async function getLoads(limit = 100) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "dispatch:read");
    const rows = await tx.load.findMany({
      where: { organizationId: access.organizationId, archivedAt: null },
      orderBy: [{ number: "desc" }],
      take: Math.min(Math.max(limit, 1), 200),
      select: loadSummarySelect,
    });
    return rows.map(toLoadSummaryDTO);
  });
}

export async function getLoad(loadId: string) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "dispatch:read");
    const row = await tx.load.findFirst({
      where: { id: loadId, organizationId: access.organizationId, archivedAt: null },
      select: loadSummarySelect,
    });
    return row ? toLoadSummaryDTO(row) : null;
  });
}