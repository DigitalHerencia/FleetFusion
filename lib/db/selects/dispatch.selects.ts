import type { Prisma } from "../../../generated/prisma/client";

export const loadSummarySelect = {
  id: true,
  number: true,
  referenceNumber: true,
  status: true,
  rate: true,
  miles: true,
  podReceivedAt: true,
  version: true,
  customer: { select: { id: true, name: true } },
  driver: { select: { id: true, firstName: true, lastName: true } },
  vehicle: { select: { id: true, unitNumber: true } },
  stops: {
    orderBy: { sequence: "asc" },
    select: {
      id: true,
      sequence: true,
      type: true,
      locationName: true,
      city: true,
      state: true,
      windowStart: true,
      windowEnd: true,
      arrivedAt: true,
      departedAt: true,
    },
  },
} satisfies Prisma.LoadSelect;

export type LoadSummaryRecord = Prisma.LoadGetPayload<{
  select: typeof loadSummarySelect;
}>;