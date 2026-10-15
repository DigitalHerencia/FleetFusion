import type { IftaReportStatus } from '@prisma/client';

export type JurisdictionMiles = Record<string, number>;

export interface IftaTrip {
  id: string;
  organizationId: string;
  vehicleId: string;
  driverId: string | null;
  tripNumber: string;
  startedAt: Date | string;
  endedAt: Date | string | null;
  totalMiles: number | null;
  jurisdictionMiles: JurisdictionMiles | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  vehicle?: { id: string; name: string; vin?: string | null } | null;
  driver?: { id: string; firstName?: string | null; lastName?: string | null } | null;
}

export interface IftaFuelPurchase {
  id: string;
  organizationId: string;
  vehicleId: string;
  driverId: string | null;
  purchaseDate: Date | string;
  jurisdiction: string;
  gallons: number;
  amountCents: number;
  currency: string;
  vendor: string | null;
  vehicle?: { id: string; name: string; vin?: string | null } | null;
  driver?: { id: string; firstName?: string | null; lastName?: string | null } | null;
}

export interface IftaJurisdictionSummary {
  jurisdiction: string;
  miles: number;
  gallons: number;
  taxRate?: number;
  taxPaid?: number;
  taxableGallons?: number;
  taxDue?: number;
}

export interface IftaReportSummary {
  year: number;
  quarter: number;
  jurisdictions: IftaJurisdictionSummary[];
  rows?: IftaJurisdictionSummary[];
  totalMiles: number;
  totalGallons: number;
  totalTaxDue?: number;
}

export interface IftaReport {
  id: string;
  organizationId: string;
  year: number;
  quarter: number;
  status: IftaReportStatus | string;
  summary: IftaReportSummary | Record<string, unknown>;
  createdAt: Date | string;
  updatedAt?: Date | string;
}
