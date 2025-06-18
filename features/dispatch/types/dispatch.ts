/**
 * Type definitions for the dispatch module
 */

import type { User } from './index';
import type { Metadata } from './metadata';

export interface Load {
  id: string;
  organizationId: string;
  referenceNumber: string;
  status: LoadStatus;
  priority: LoadPriority;
  customer: Customer;
  origin: Location;
  destination: Location;
  pickupDate: Date;
  deliveryDate: Date;
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  driver?: LoadAssignedDriver;
  vehicle?: LoadAssignedVehicle;
  trailer?: LoadAssignedTrailer;
  equipment?: EquipmentRequirement;
  cargo: CargoDetails;
  rate: Rate;
  miles?: number;
  estimatedMiles?: number;
  fuelCost?: number;
  notes?: string;
  internalNotes?: string;
  specialInstructions?: string;
  documents?: LoadDocument[];
  statusHistory?: LoadStatusEvent[];
  trackingUpdates?: TrackingUpdate[];
  brokerInfo?: BrokerInfo;
  factoring?: FactoringInfo;
  alerts?: LoadAlert[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
  statusEvents?: LoadStatusEvent[];
}

export type LoadStatus =
  | 'draft'
  | 'pending'
  | 'posted'
  | 'booked'
  | 'confirmed'
  | 'assigned'
  | 'dispatched'
  | 'in_transit'
  | 'at_pickup'
  | 'picked_up'
  | 'en_route'
  | 'at_delivery'
  | 'delivered'
  | 'pod_required'
  | 'completed'
  | 'invoiced'
  | 'paid'
  | 'cancelled'
  | 'problem';

export type LoadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface LoadStatusEvent {
  id: string;
  loadId: string;
  status: LoadStatus;
  timestamp: Date;
  location?: Partial<Location>;
  notes?: string;
  automaticUpdate: boolean;
  source: 'system' | 'driver' | 'dispatcher' | 'customer' | 'eld';
  createdBy?: string;
}

export interface TrackingUpdate {
  id: string;
  loadId: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
  };
  speed?: number;
  heading?: number;
  source: 'gps' | 'manual' | 'eld' | 'driver_app';
  accuracy?: number;
}

export interface LoadAssignedDriver {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  cdlClass?: string;
  assignedAt: Date;
  assignedBy: string;
}

export interface LoadAssignedVehicle {
  id: string;
  unit: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  assignedAt: Date;
  assignedBy: string;
}

export interface LoadAssignedTrailer {
  id: string;
  unit: string;
  type: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  assignedAt: Date;
  assignedBy: string;
}

export interface EquipmentRequirement {
  type:
    | 'dry_van'
    | 'reefer'
    | 'flatbed'
    | 'step_deck'
    | 'lowboy'
    | 'tanker'
    | 'container'
    | 'other';
  length?: number;
  temperatureMin?: number;
  temperatureMax?: number;
  hazmat?: boolean;
  overweight?: boolean;
  oversized?: boolean;
  specialPermits?: string[];
  notes?: string;
}

export interface CargoDetails {
  description: string;
  commodity?: string;
  weight: number;
  pieces?: number;
  pallets?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  value?: number;
  hazmat?: {
    class: string;
    unNumber: string;
    properShippingName: string;
    placard?: string;
  };
  temperature?: {
    min: number;
    max: number;
    unit: 'F' | 'C';
  };
  specialHandling?: string[];
}

export interface BrokerInfo {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  mcNumber?: string;
  dotNumber?: string;
  brokerageRate?: number;
  commissionRate?: number;
}

export interface FactoringInfo {
  company: string;
  accountNumber?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  factorRate?: number;
  advanceRate?: number;
}

export interface LoadAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
  autoResolve: boolean;
  resolvedAt?: Date;
}

export interface Customer {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  mcNumber?: string;
  dotNumber?: string;
  creditLimit?: number;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadDocument {
  id: string;
  loadId: string;
  name: string;
  type:
    | 'bol'
    | 'pod'
    | 'invoice'
    | 'receipt'
    | 'permit'
    | 'contract'
    | 'rate_confirmation'
    | 'other';
  category: 'pickup' | 'delivery' | 'administrative' | 'billing' | 'compliance';
  url: string;
  fileSize: number;
  mimeType: string;
  isRequired: boolean;
  isReceived: boolean;
  receivedAt?: Date;
  uploadedAt: Date;
  uploadedBy: string;
  description?: string;
  metadata?: Metadata;
}

export interface Location {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}

export interface Rate {
  total: number;
  currency: string;
  type: 'flat' | 'per_mile' | 'percentage';
  lineHaul: number;
  fuelSurcharge?: number;
  detention?: number;
  layover?: number;
  loading?: number;
  unloading?: number;
  additionalStops?: number;
  deadhead?: number;
  permits?: number;
  tolls?: number;
  other?: number;
  otherDescription?: string;
  advancePay?: number;
  brokerageRate?: number;
  commissionRate?: number;
  driverPay?: number;
  driverPayType?: 'percentage' | 'flat' | 'per_mile';
  profit?: number;
  profitMargin?: number;
  notes?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'bol' | 'pod' | 'invoice' | 'other';
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Vehicle {
  id: string;
  tenantId: string;
  type: 'truck' | 'van' | 'trailer';
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'out_of_service';
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  currentOdometer?: number;
}

export interface Trailer {
  id: string;
  tenantId: string;
  type: 'dry_van' | 'reefer' | 'flatbed' | 'step_deck' | 'other';
  length: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'out_of_service';
}
