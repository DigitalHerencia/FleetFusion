/**
 * Type definitions for the drivers module
 * Comprehensive driver management for FleetFusion TMS
 */

// ================== Core Driver Types ==================

export interface Driver {
  id: string;
  tenantId: string;
  externalId?: string; // Reference to Clerk user if applicable

  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: DriverAddress;

  // Employment Information
  employeeId?: string;
  hireDate: string;
  terminationDate?: string;
  payRate?: number;
  payType?: 'hourly' | 'mileage' | 'salary' | 'percentage';
  homeTerminal: string;

  // License & Certifications
  cdlNumber: string;
  cdlState: string;
  cdlClass: 'A' | 'B' | 'C';
  cdlExpiration: string;
  endorsements?: string[];
  restrictions?: string[];

  // Medical & Compliance
  medicalCardNumber?: string;
  medicalCardExpiration: string;
  drugTestDate?: string;
  drugTestStatus?: 'passed' | 'failed' | 'pending';

  // Operational Status
  status: DriverStatus;
  availabilityStatus: DriverAvailabilityStatus;
  currentLocation?: DriverLocation;
  currentAssignment?: string; // Load ID if assigned

  // Emergency Contact
  emergencyContact?: DriverEmergencyContact;

  // Performance & Safety
  safetyScore?: number;
  violationCount: number;
  accidentCount: number;
  onTimeDeliveryRate?: number;

  // System Fields
  isActive: boolean;
  notes?: string;
  tags?: string[];
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type DriverStatus =
  | 'available' // Available for assignment
  | 'assigned' // Assigned to a load
  | 'driving' // Currently driving
  | 'on_duty' // On duty but not driving
  | 'off_duty' // Off duty
  | 'sleeper_berth' // In sleeper berth
  | 'personal_conveyance' // Personal conveyance
  | 'yard_moves' // Yard moves
  | 'inactive' // Temporarily inactive
  | 'terminated'; // Employment terminated

export type DriverAvailabilityStatus =
  | 'available' // Available for new assignments
  | 'busy' // Currently assigned/driving
  | 'maintenance' // Vehicle in maintenance
  | 'vacation' // On vacation/leave
  | 'sick' // Sick leave
  | 'suspended'; // Suspended

// ================== Supporting Types ==================

export interface DriverAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
  address?: string;
  lastUpdated: string;
  source: 'gps' | 'manual' | 'estimated';
}

export interface DriverEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

// ================== Documents & Compliance ==================

export interface DriverDocument {
  id: string;
  driverId: string;
  type: DriverDocumentType;
  name: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;

  // Document specifics
  issueDate?: string;
  expirationDate?: string;
  issuingAuthority?: string;
  documentNumber?: string;

  // System fields
  status: 'active' | 'expired' | 'pending' | 'rejected';
  uploadedBy: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type DriverDocumentType =
  | 'cdl_license'
  | 'medical_certificate'
  | 'drug_test_result'
  | 'background_check'
  | 'training_certificate'
  | 'employment_contract'
  | 'insurance_card'
  | 'w4_form'
  | 'i9_form'
  | 'safety_training'
  | 'hazmat_endorsement'
  | 'other';

// ================== Hours of Service ==================

export interface HoursOfService {
  id: string;
  driverId: string;
  date: string;

  // Duty Status
  status: HOSStatus;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Time tracking
  startTime: string;
  endTime?: string;
  duration: number; // in minutes

  // Additional details
  vehicleId?: string;
  odometer?: number;
  engineHours?: number;
  trailer?: string;
  shipping?: string;

  // Compliance
  remark?: string;
  isPersonalTime: boolean;
  isDriving: boolean;

  // System fields
  source: 'manual' | 'eld' | 'automatic';
  createdAt: string;
  updatedAt: string;
}

export type HOSStatus =
  | 'off_duty'
  | 'sleeper_berth'
  | 'driving'
  | 'on_duty_not_driving'
  | 'personal_conveyance'
  | 'yard_moves';

// ================== Performance & Analytics ==================

export interface DriverPerformance {
  driverId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;

  metrics: {
    // Productivity
    totalMiles: number;
    totalHours: number;
    totalLoads: number;
    revenue: number;

    // Efficiency
    milesPerGallon: number;
    revenuePerMile: number;
    utilizationRate: number; // % of time productive

    // Safety & Compliance
    safetyScore: number;
    violations: number;
    accidents: number;
    inspectionScore?: number;

    // Delivery Performance
    onTimeDeliveryRate: number;
    averageDeliveryTime: number;
    customerRating?: number;

    // HOS Compliance
    hosViolations: number;
    availableHours: number;
    usedHours: number;
  };

  // Comparative metrics
  ranking?: {
    overall: number;
    safety: number;
    efficiency: number;
    onTime: number;
  };

  calculatedAt: string;
}

// ================== Assignment & Scheduling ==================

export interface DriverAssignment {
  id: string;
  driverId: string;
  loadId?: string;
  vehicleId?: string;
  trailerId?: string;

  assignmentType: 'load' | 'maintenance' | 'training' | 'other';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

  scheduledStart: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;

  instructions?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';

  assignedBy: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ================== Form & API Types ==================

export interface DriverFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: Partial<DriverAddress>;

  employeeId?: string;
  hireDate: string;
  payRate?: number;
  payType?: 'hourly' | 'mileage' | 'salary' | 'percentage';
  homeTerminal: string;

  cdlNumber: string;
  cdlState: string;
  cdlClass: 'A' | 'B' | 'C';
  cdlExpiration: string;
  endorsements?: string[];
  restrictions?: string[];

  medicalCardNumber?: string;
  medicalCardExpiration: string;

  emergencyContact?: DriverEmergencyContact;
  notes?: string;
  tags?: string[];
}

export interface DriverUpdateData {
  phone?: string;
  address?: Partial<DriverAddress>;
  payRate?: number;
  payType?: 'hourly' | 'mileage' | 'salary' | 'percentage';
  homeTerminal?: string;

  cdlExpiration?: string;
  endorsements?: string[];
  restrictions?: string[];
  medicalCardExpiration?: string;

  status?: DriverStatus;
  availabilityStatus?: DriverAvailabilityStatus;

  emergencyContact?: DriverEmergencyContact;
  notes?: string;
  tags?: string[];
}

export interface DriverFilters {
  search?: string;
  status?: DriverStatus[];
  availabilityStatus?: DriverAvailabilityStatus[];
  homeTerminal?: string[];
  cdlClass?: ('A' | 'B' | 'C')[];
  endorsements?: string[];

  // Expiration alerts
  cdlExpiringInDays?: number;
  medicalExpiringInDays?: number;

  // Performance filters
  minSafetyScore?: number;
  maxViolations?: number;

  // Date filters
  hiredAfter?: string;
  hiredBefore?: string;

  // Pagination
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ================== API Response Types ==================

export interface DriverListResponse {
  drivers: Driver[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DriverStatsResponse {
  totalDrivers: number;
  activeDrivers: number;
  availableDrivers: number;
  drivingDrivers: number;

  expiringCDLs: number;
  expiringMedicals: number;

  averageSafetyScore: number;
  totalViolations: number;

  utilizationRate: number;
}

// ================== Action Result Types ==================

export interface DriverActionResult {
  success: boolean;
  data?: Driver | Driver[];
  error?: string;
  code?: string;
}

export interface DriverValidationError {
  field: string;
  message: string;
}

export interface DriverBulkActionResult {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{
    driverId: string;
    error: string;
  }>;
}

// ================== Type Guards ==================

export function isDriver(obj: unknown): obj is Driver {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as any).id === 'string' &&
    'tenantId' in obj &&
    typeof (obj as any).tenantId === 'string' &&
    'cdlNumber' in obj &&
    typeof (obj as any).cdlNumber === 'string' &&
    'status' in obj &&
    typeof (obj as any).status === 'string'
  );
}
