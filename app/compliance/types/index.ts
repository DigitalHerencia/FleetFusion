export type ComplianceDocumentRecord = {
  id: string;
  type: string;
  status: string;
  title: string;
  description?: string | null;
  issueDate?: Date | string | null;
  effectiveDate?: Date | string | null;
  expirationDate?: Date | string | null;
  createdAt: Date | string;
  vehicle?: { name?: string | null; plateNumber?: string | null } | null;
  driver?: { firstName: string; lastName: string } | null;
  file?: { url: string } | null;
  alerts?: Array<{ id: string; severity: string; state: string }>;
  auditLogs?: Array<{ id: string; action: string; createdAt: Date | string }>;
};

export type ComplianceSummary = {
  total: number;
  valid: number;
  expiring: number;
  expired: number;
  exempt: number;
  vehicles: number;
  drivers: number;
};
