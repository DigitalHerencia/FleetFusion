import type { LoadSummaryDTO } from "../../../types/dispatchTypes";
import type { LoadSummaryRecord } from "../selects/dispatch.selects";

export function toLoadSummaryDTO(record: LoadSummaryRecord): LoadSummaryDTO {
  return {
    id: record.id,
    number: record.number,
    referenceNumber: record.referenceNumber,
    status: record.status,
    rate: record.rate.toString(),
    miles: record.miles,
    podReceivedAt: record.podReceivedAt?.toISOString() ?? null,
    customer: record.customer,
    driver: record.driver
      ? { id: record.driver.id, name: `${record.driver.firstName} ${record.driver.lastName}` }
      : null,
    vehicle: record.vehicle,
    stops: record.stops.map((s) => ({
      ...s,
      windowStart: s.windowStart?.toISOString() ?? null,
      windowEnd: s.windowEnd?.toISOString() ?? null,
      arrivedAt: s.arrivedAt?.toISOString() ?? null,
      departedAt: s.departedAt?.toISOString() ?? null,
    })),
    version: record.version,
  };
}