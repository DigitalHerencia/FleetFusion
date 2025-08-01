import type { UserRole } from './auth';
import type { ApiResponse, PaginatedResponse } from './index';

export type VehicleType = 'tractor' | 'trailer' | 'straight_truck' | 'other';
export type VehicleStatus = 'active' | 'inactive' | 'maintenance' | 'decommissioned';

export interface Vehicle {
  lastMaintenanceDate: Date | null;
  lastMaintenanceMileage: number | null;
  id: string;
  organizationId: string;
  type: VehicleType;
  status: VehicleStatus;

  // Basic Information
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  licensePlateState?: string;
  unitNumber: string;

  // Specifications
  grossVehicleWeight?: number;
  maxPayload?: number;
  fuelType?: string;
  engineType?: string;
  fuelCapacity?: number;

  // Registration & Insurance
  registrationNumber?: string;
  registrationExpiration?: Date;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiration?: Date;

  // Location & Mileage
  currentLocation?: string;
  totalMileage?: number;
  currentOdometer?: number;
  lastOdometerUpdate?: Date;

  // Maintenance
  nextMaintenanceDate?: Date;
  nextMaintenanceMileage?: number;
  lastInspectionDate?: Date;
  nextInspectionDue?: Date;

  // Financial
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;

  // Additional
  notes?: string;
  customFields?: Record<string, unknown>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relations
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

export interface VehicleFormData {
  // Basic Information
  type: VehicleType;
  unitNumber: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  licensePlateState?: string;

  // Specifications
  grossVehicleWeight?: number;
  maxPayload?: number;
  fuelType?: string;
  engineType?: string;
  fuelCapacity?: number;

  // Registration & Insurance
  registrationNumber?: string;
  registrationExpiration?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiration?: string;

  // Location & Mileage
  currentLocation?: string;
  totalMileage?: number;
  currentOdometer?: number;

  // Maintenance
  nextMaintenanceDate?: string;
  nextMaintenanceMileage?: number;
  lastInspectionDate?: string;
  nextInspectionDue?: string;

  // Financial
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;

  // Additional
  notes?: string;
}

export interface VehicleFilters {
  search?: string;
  type?: VehicleType;
  status?: VehicleStatus;
  make?: string;
  model?: string;
  year?: number;
  assignedUserId?: string;
  maintenanceDue?: boolean;
  page?: number;
  limit?: number;
}

export type VehicleListResponse = PaginatedResponse<Vehicle>;

export interface VehicleMaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'preventive' | 'repair' | 'inspection' | 'recall';
  description: string;
  performedBy?: string;
  cost?: number;
  mileageAtService: number;
  serviceDate: Date;
  nextServiceDue?: Date;
  nextServiceMileage?: number;
  notes?: string;
  parts?: string[];
  laborHours?: number;
  warrantyInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleUtilizationStats {
  vehicleId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalMiles: number;
  revenue: number;
  revenuePerMile: number;
  utilizationPercentage: number;
  fuelCosts: number;
  maintenanceCosts: number;
  profit: number;
  loadCount: number;
  avgLoadRevenue: number;
}

// ================== Action Result Types ==================

export interface VehicleActionResult extends ApiResponse<Vehicle> {
  fieldErrors?: Record<string, string[]>;
}
