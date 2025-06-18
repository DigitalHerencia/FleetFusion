/**
 * Type definitions for the IFTA (International Fuel Tax Agreement) module
 */

export interface FuelPurchase {
  id: string;
  tenantId: string;
  vehicleId: string;
  driverId: string;
  date: Date;
  location: {
    name: string;
    address?: string;
    city: string;
    state: string;
    country: string;
  };
  gallons: number;
  cost: number;
  odometer: number;
  fuelType: 'diesel' | 'gasoline';
  receiptUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MileageByJurisdiction {
  id: string;
  tenantId: string;
  vehicleId: string;
  quarter: number;
  year: number;
  jurisdictions: JurisdictionMileage[];
  totalMiles: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JurisdictionMileage {
  jurisdiction: string; // State/Province code
  miles: number;
  fuelGallons?: number;
  taxPaid?: number;
}

export interface IftaReport {
  id: string;
  tenantId: string;
  quarter: number;
  year: number;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  dueDate: Date;
  submittedDate?: Date;
  totalMiles: number;
  totalGallons: number;
  mpg: number;
  jurisdictionSummaries: IftaJurisdictionSummary[];
  netTaxDue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IftaJurisdictionSummary {
  jurisdiction: string;
  totalMiles: number;
  taxableMiles: number;
  taxableGallons: number;
  taxRate: number;
  taxDue: number;
  taxPaid: number;
  netTaxDue: number;
  // Additional fields for calculations
  miles?: number;
  fuelGallons?: number;
}

export interface TripReport {
  id: string;
  tenantId: string;
  vehicleId: string;
  driverId: string;
  loadId?: string;
  startDate: Date;
  endDate: Date;
  startOdometer: number;
  endOdometer: number;
  totalMiles: number;
  jurisdictions: {
    jurisdiction: string;
    miles: number;
  }[];
  fuelPurchases: FuelPurchase[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IftaPeriodSummary {
  totalMiles: number;
  totalGallons: number;
  averageMpg: number;
  totalFuelCost: number;
}

export interface IftaTripRecord {
  id: string;
  date: Date;
  vehicleId: string;
  vehicle: {
    id: string;
    unitNumber: string;
    make: string;
    model: string;
  };
  jurisdiction: string;
  distance: number;
  fuelUsed: number | null;
  notes?: string | null;
  // Additional fields for table compatibility
  driver?: string;
  startLocation?: string;
  endLocation?: string;
  miles?: number;
  gallons?: number;
  state?: string;
}

export interface IftaFuelPurchaseRecord {
  id: string;
  date: Date;
  vehicleId: string;
  vehicle: {
    id: string;
    unitNumber: string;
    make: string;
    model: string;
  };
  jurisdiction: string;
  gallons: number;
  amount: number;
  vendor?: string | null;
  receiptNumber?: string | null;
  notes?: string | null;
}

export interface IftaPeriodData {
  period: { quarter: number; year: number };
  summary: IftaPeriodSummary;
  trips: IftaTripRecord[];
  fuelPurchases: IftaFuelPurchaseRecord[];
  jurisdictionSummary: IftaJurisdictionSummary[];
  report: {
    id: string;
    status: string;
    submittedAt: Date | null;
    dueDate: Date | null;
  } | null;
}

// Enhanced PDF Generation Types
export interface PDFGenerationRequest {
  organizationId: string;
  reportType: 'QUARTERLY' | 'TRIP_LOG' | 'FUEL_SUMMARY' | 'CUSTOM';
  quarter?: string;
  year?: number;
  startDate?: Date;
  endDate?: Date;
  vehicleId?: string;
  jurisdictions?: string[];
  options: PDFOptions;
}

export interface PDFGenerationResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
  generationTime?: number;
  metadata?: {
    pageCount: number;
    version: string;
    generatedAt: Date;
    reportType: string;
  };
}

export interface PDFOptions {
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  includeSignature: boolean;
  watermark?: 'official' | 'draft' | 'none';
  includeAttachments?: boolean;
  compressionLevel?: 'none' | 'low' | 'medium' | 'high';
  customMetadata?: Record<string, string>;
}

export interface CustomReportOptions extends PDFOptions {
  reportType: 'detailed' | 'summary' | 'audit' | 'exception';
  includeTrips: boolean;
  includeFuel: boolean;
  includeTaxCalculations: boolean;
  includeCharts: boolean;
  jurisdictions?: string[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  groupBy?: 'vehicle' | 'jurisdiction' | 'date' | 'none';
  sortBy?: 'date' | 'amount' | 'miles' | 'jurisdiction';
  sortOrder?: 'asc' | 'desc';
}

export interface DigitalSignature {
  signerId: string;
  signerName: string;
  signerTitle?: string;
  timestamp: Date;
  certificate?: string;
  algorithm: string;
  reason: string;
  location: string;
  isValid: boolean;
}

export interface IFTAReportData {
  quarter: any;
  year: any;
  organizationId: any;
  reportSummary: any;
  organization: {
    id: string;
    name: string;
    mcNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  reportPeriod: {
    quarter: string;
    year: number;
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalMiles: number;
    totalGallons: number;
    totalTaxDue: number;
    totalTaxPaid: number;
    netTaxDue: number;
  };
  jurisdictions: JurisdictionSummary[];
  trips?: TripSummary[];
  fuelPurchases?: FuelPurchaseSummary[];
  submittedBy?: string;
  submittedAt?: Date;
}

export interface JurisdictionSummary {
  jurisdiction: string;
  jurisdictionName: string;
  miles: number;
  fuelPurchased: number;
  fuelConsumed: number;
  taxRate: number;
  taxDue: number;
  taxPaid: number;
  netTax: number;
}

export interface TripSummary {
  id: string;
  date: Date;
  vehicleId: string;
  vehicleUnitNumber: string;
  startLocation: string;
  endLocation: string;
  miles: number;
  jurisdiction: string;
  fuelUsed?: number;
  notes?: string;
}

export interface FuelPurchaseSummary {
  id: string;
  date: Date;
  vehicleId: string;
  vehicleUnitNumber: string;
  vendor: string;
  jurisdiction: string;
  gallons: number;
  amount: number;
  receiptNumber?: string;
  notes?: string;
}

// Enhanced IFTA Domain Types for Tax Management
export interface JurisdictionTaxRate {
  id: string;
  organizationId: string;
  jurisdiction: string;
  taxRate: number;
  effectiveDate: Date;
  endDate?: Date;
  source: 'GOVERNMENT' | 'MANUAL';
  verifiedDate: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface IftaTaxCalculation {
  id: string;
  organizationId: string;
  reportId: string;
  jurisdiction: string;
  totalMiles: number;
  taxableMiles: number;
  fuelPurchased: number;
  fuelConsumed: number;
  taxRate: number;
  taxDue: number;
  taxPaid: number;
  taxCredits: number;
  adjustments: number;
  netTaxDue: number;
  calculatedAt: Date;
  calculatedBy: string;
  isValidated: boolean;
  validatedAt?: Date;
  validatedBy?: string;
}

// Database model types for IFTA PDF Generation and Reports
export interface IftaPDFGenerationLog {
  id: string;
  organizationId: string;
  userId: string;
  reportType: string;
  parameters: Record<string, any>;
  status: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface IftaReportPDF {
  id: string;
  organizationId: string;
  reportId: string;
  reportType: string;
  quarter?: string;
  year?: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  generatedAt: Date;
  generatedBy: string;
  isOfficial: boolean;
  watermark?: string;
  downloadCount: number;
  lastDownload?: Date;
  metadata?: Record<string, any>;
  generatedByUser?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface IftaAuditLog {
  id: string;
  organizationId: string;
  entityType: 'TRIP' | 'FUEL_PURCHASE' | 'REPORT' | 'TAX_CALCULATION';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SUBMIT' | 'APPROVE';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}
