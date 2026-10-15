import type { LoadStatus, LoadStopType } from "@/generated/prisma/enums";

export interface LoadStopDTO {
  id: string;
  sequence: number;
  type: LoadStopType;
  locationName: string | null;
  city: string;
  state: string;
  windowStart: string | null;
  windowEnd: string | null;
  arrivedAt: string | null;
  departedAt: string | null;
}

export interface LoadSummaryDTO {
  id: string;
  number: number;
  referenceNumber: string | null;
  status: LoadStatus;
  rate: string;
  miles: number | null;
  podReceivedAt: string | null;
  customer: { id: string; name: string } | null;
  driver: { id: string; name: string } | null;
  vehicle: { id: string; unitNumber: string } | null;
  stops: LoadStopDTO[];
  version: number;
}