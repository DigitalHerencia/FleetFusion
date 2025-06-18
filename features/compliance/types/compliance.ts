import type { MetadataRecord } from "./metadata";
/**
 * Type definitions for the compliance module
 */

import type { ComplianceMetadata, Metadata } from './metadata';

export interface ComplianceDocument {
  id: string;
  tenantId: string;
  entityType: 'driver' | 'vehicle' | 'trailer' | 'company';
  entityId: string;
  type: ComplianceDocumentType;
  name: string;
  description?: string;
  status: 'valid' | 'expiring' | 'expired' | 'pending' | 'rejected';
  issuedDate: Date;
  expirationDate?: Date;
  documentNumber?: string;
  issuingAuthority?: string;
  url?: string;
  fileSize?: number;
  mimeType?: string;
  notes?: string;
  reminderDays: number[];
  autoRenewal?: boolean;
  renewalStatus?:
    | 'not_applicable'
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'failed';
  renewalNotes?: string;
  tags?: string[];
  metadata?: ComplianceMetadata;
  uploadedBy: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ComplianceDocumentType =
  // Company documents
  | 'dot_authority'
  | 'operating_authority'
  | 'business_license'
  | 'insurance_general'
  | 'insurance_cargo'
  | 'insurance_liability'
  | 'workers_comp'
  | 'ifta_license'
  | 'irs_form_2290'
  | 'ucr_registration'
  | 'drug_testing_program'
  | 'safety_management_cert'
  // Driver documents
  | 'cdl_license'
  | 'medical_certificate'
  | 'drug_test_results'
  | 'alcohol_test_results'
  | 'background_check'
  | 'mvr_report'
  | 'employment_verification'
  | 'road_test_certificate'
  | 'hazmat_endorsement'
  | 'twic_card'
  | 'passport'
  | 'driver_qualification_file'
  // Vehicle documents
  | 'vehicle_registration'
  | 'vehicle_title'
  | 'annual_inspection'
  | 'emission_test'
  | 'apportioned_registration'
  | 'vehicle_insurance'
  | 'lease_agreement'
  | 'maintenance_contract'
  | 'warranty_info'
  // Trailer documents
  | 'trailer_registration'
  | 'trailer_title'
  | 'trailer_inspection'
  | 'trailer_insurance'
  | 'trailer_lease'
  // Other
  | 'permit'
  | 'contract'
  | 'other';

export interface HosLog {
  id: string;
  tenantId: string;
  driverId: string;
  date: Date;
  status: 'compliant' | 'violation' | 'pending_review';
  logs: HosEntry[];
  breaks: HosBreak[];
  totalDriveTime: number; // in minutes
  totalOnDutyTime: number; // in minutes
  totalOffDutyTime: number; // in minutes
  sleeperBerthTime: number; // in minutes
  personalConveyanceTime: number; // in minutes
  yardMovesTime: number; // in minutes
  violations?: HosViolation[];
  certifiedBy?: string;
  certifiedAt?: Date;
  notes?: string;
  eldData?: EldData;
  createdAt: Date;
  updatedAt: Date;
}

export interface HosEntry {
  id: string;
  startTime: Date;
  endTime: Date;
  status:
    | 'driving'
    | 'on_duty'
    | 'off_duty'
    | 'sleeper_berth'
    | 'personal_conveyance'
    | 'yard_moves';
  location: string;
  odometer?: number;
  engineHours?: number;
  notes?: string;
  automaticEntry: boolean;
  source: 'manual' | 'eld' | 'driver_app' | 'gps';
}

export interface HosBreak {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  type: '30_minute' | '8_hour' | '10_hour' | '34_hour' | 'other';
  location: string;
  notes?: string;
}

export interface HosViolation {
  id: string;
  type:
    | '11_hour'
    | '14_hour'
    | '70_hour'
    | '8_hour_break'
    | '30_minute_break'
    | '34_hour_restart'
    | '60_70_hour'
    | 'other';
  description: string;
  severity: 'minor' | 'major' | 'critical';
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  fineAmount?: number;
  courtDate?: Date;
  status: 'open' | 'under_review' | 'resolved' | 'disputed';
}

export interface EldData {
  deviceId: string;
  deviceManufacturer: string;
  deviceModel: string;
  firmwareVersion: string;
  dataTransferMethod: 'web' | 'email' | 'usb' | 'bluetooth';
  lastSyncAt: Date;
  rawData?: Metadata;
  malfunctions?: EldMalfunction[];
  dataQuality: 'good' | 'fair' | 'poor';
}

export interface EldMalfunction {
  id: string;
  type:
    | 'power'
    | 'engine_sync'
    | 'positioning'
    | 'data_recording'
    | 'data_transfer'
    | 'other';
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved' | 'acknowledged';
}

export interface DvirReport {
  id: string;
  tenantId: string;
  vehicleId: string;
  driverId: string;
  date: Date;
  type: 'pre_trip' | 'post_trip' | 'en_route';
  shift: 'start' | 'end';
  odometer: number;
  engineHours?: number;
  location: string;
  defects: DvirDefect[];
  safeToOperate: boolean;
  defectsFound: boolean;
  defectsCorrected: boolean;
  notes?: string;
  driverSignature: string;
  mechanicSignature?: string;
  mechanicName?: string;
  mechanicCertification?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  status: 'pending' | 'approved' | 'requires_attention' | 'out_of_service';
  images?: DvirImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DvirDefect {
  id: string;
  category:
    | 'brakes'
    | 'coupling'
    | 'engine'
    | 'exhaust'
    | 'fuel_system'
    | 'lights'
    | 'steering'
    | 'tires'
    | 'suspension'
    | 'electrical'
    | 'body'
    | 'other';
  subcategory?: string;
  description: string;
  severity: 'minor' | 'major' | 'critical' | 'out_of_service';
  location: string; // specific location on vehicle
  repaired: boolean;
  repairedBy?: string;
  repairedDate?: Date;
  repairDescription?: string;
  partNumber?: string;
  laborHours?: number;
  cost?: number;
  images?: DvirImage[];
  requiresInspection: boolean;
  inspectedBy?: string;
  inspectedAt?: Date;
  notes?: string;
}

export interface DvirImage {
  id: string;
  url: string;
  caption?: string;
  timestamp: Date;
  uploadedBy: string;
}

export interface MaintenanceRecord {
  id: string;
  tenantId: string;
  vehicleId: string;
  type: 'preventive' | 'corrective' | 'inspection' | 'recall' | 'warranty';
  category:
    | 'engine'
    | 'transmission'
    | 'brakes'
    | 'tires'
    | 'electrical'
    | 'hvac'
    | 'body'
    | 'other';
  description: string;
  scheduledDate?: Date;
  completedDate?: Date;
  dueDate?: Date;
  odometer: number;
  engineHours?: number;
  status: 'scheduled' | 'overdue' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  vendor?: MaintenanceVendor;
  technician?: string;
  laborHours?: number;
  parts?: MaintenancePart[];
  totalCost?: number;
  laborCost?: number;
  partsCost?: number;
  warranty?: MaintenanceWarranty;
  images?: DvirImage[];
  documents?: string[];
  notes?: string;
  nextServiceOdometer?: number;
  nextServiceDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceVendor {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  specialties?: string[];
  rating?: number;
  preferredVendor: boolean;
}

export interface MaintenancePart {
  id: string;
  partNumber: string;
  description: string;
  manufacturer: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  warranty?: MaintenanceWarranty;
  supplier?: string;
}

export interface MaintenanceWarranty {
  type: 'parts' | 'labor' | 'both';
  duration: number; // in months
  mileage?: number;
  description?: string;
  startDate: Date;
  endDate: Date;
  warrantyNumber?: string;
  terms?: string;
}

export interface SafetyEvent {
  id: string;
  tenantId: string;
  type:
    | 'accident'
    | 'violation'
    | 'inspection'
    | 'complaint'
    | 'incident'
    | 'citation';
  severity: 'minor' | 'major' | 'serious' | 'critical';
  status: 'open' | 'under_review' | 'closed' | 'disputed';
  date: Date;
  location: string;
  driverId?: string;
  vehicleId?: string;
  description: string;
  injuriesReported: boolean;
  fatalitiesReported: boolean;
  propertyDamage: boolean;
  estimatedDamage?: number;
  policeCalled: boolean;
  policeReportNumber?: string;
  citationIssued: boolean;
  citationNumber?: string;
  fineAmount?: number;
  courtDate?: Date;
  insuranceClaim?: InsuranceClaim;
  rootCause?: string;
  correctiveActions?: CorrectiveAction[];
  preventiveMeasures?: string[];
  reportedBy: string;
  reportedAt: Date;
  investigatedBy?: string;
  investigatedAt?: Date;
  documents?: string[];
  images?: DvirImage[];
  witnesses?: Witness[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceClaim {
  claimNumber: string;
  insurer: string;
  adjusterId?: string;
  adjusterPhone?: string;
  adjusterEmail?: string;
  estimatedAmount?: number;
  paidAmount?: number;
  status: 'filed' | 'under_review' | 'approved' | 'denied' | 'settled';
  filedDate: Date;
  settledDate?: Date;
  notes?: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  notes?: string;
}

export interface Witness {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  statement?: string;
  relationship: 'employee' | 'customer' | 'bystander' | 'other';
}

export interface ComplianceAlert {
  id: string;
  tenantId: string;
  type:
    | 'expiring_document'
    | 'hos_violation'
    | 'maintenance_due'
    | 'inspection_due'
    | 'safety_event'
    | 'audit_finding';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  entityType: 'driver' | 'vehicle' | 'trailer' | 'company' | 'load';
  entityId: string;
  dueDate?: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  metadata?: ComplianceMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditTrial {
  id: string;
  tenantId: string;
  auditType: 'dot' | 'fmcsa' | 'state' | 'internal' | 'customer' | 'insurance';
  auditDate: Date;
  auditor: string;
  auditorOrganization: string;
  scope: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'follow_up_required';
  findings: AuditFinding[];
  overallRating?: 'satisfactory' | 'conditional' | 'unsatisfactory';
  reportUrl?: string;
  nextAuditDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditFinding {
  id: string;
  category:
    | 'driver_qualification'
    | 'hos'
    | 'vehicle_maintenance'
    | 'drug_testing'
    | 'records'
    | 'insurance'
    | 'other';
  severity: 'observation' | 'minor' | 'major' | 'critical';
  description: string;
  regulation: string;
  correctiveAction?: string;
  dueDate?: Date;
  completedDate?: Date;
  status: 'open' | 'in_progress' | 'completed' | 'disputed';
  assignedTo?: string;
  evidence?: string[];
  notes?: string;
}

export const DOCUMENT_STATUS_LABELS = {
  valid: 'Active',
  expiring: 'Expiring Soon',
  expired: 'Expired',
};
