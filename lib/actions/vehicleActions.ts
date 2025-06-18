"use server";

// --- IMPORTANT ENUM SYNC ---
// When updating VehicleStatus or VehicleType:
// - Update enums in: types/vehicles.ts, schemas/vehicles.ts, prisma/schema.prisma
// - Keep all mappings in this file in sync with those enums.
// ---------------------------

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { VehicleStatus as PrismaVehicleStatus } from '@prisma/client';

import db from '@/lib/database/db';
import { handleError } from '@/lib/errors/handleError';
import { hasPermission } from '@/lib/auth/permissions';
import {
  VehicleFormSchema,
  VehicleUpdateStatusSchema,
  VehicleMaintenanceSchema,
} from '@/schemas/vehicles';
import type {
  VehicleFormData,
  VehicleUpdateStatusData,
  VehicleMaintenanceData,
} from '@/schemas/vehicles';
import type {
  Vehicle,
  VehicleActionResult,
  VehicleStatus,
  VehicleType,
} from '@/types/vehicles';

// Helper: Map app VehicleStatus to Prisma enum
function toPrismaVehicleStatus(status: VehicleStatus): PrismaVehicleStatus {
  switch (status) {
    case 'available':
    case 'assigned':
      return PrismaVehicleStatus.active;
    case 'in_maintenance':
      return PrismaVehicleStatus.maintenance;
    case 'out_of_service':
      return PrismaVehicleStatus.inactive;
    case 'retired':
      return PrismaVehicleStatus.decommissioned;
    default:
      return PrismaVehicleStatus.active;
  }
}

// Helper: Map Prisma Vehicle to public Vehicle type
function toPublicVehicle(prismaVehicle: any): Vehicle {
  // Map Prisma status to app VehicleStatus
  let status: VehicleStatus;
  switch (prismaVehicle.status) {
    case 'active':
      status = 'available';
      break;
    case 'maintenance':
      status = 'in_maintenance';
      break;
    case 'inactive':
      status = 'out_of_service';
      break;
    case 'decommissioned':
      status = 'retired';
      break;
    case 'assigned':
      status = 'assigned';
      break;
    default:
      status = 'available';
  }

  // Map Prisma type to VehicleType (ensure fallback)
  const type: VehicleType = [
    'tractor',
    'trailer',
    'straight_truck',
    'other',
  ].includes(prismaVehicle.type)
    ? prismaVehicle.type
    : 'other';

  return {
    id: prismaVehicle.id,
    organizationId: prismaVehicle.organizationId,
    type,
    status,
    make: typeof prismaVehicle.make === 'string' ? prismaVehicle.make : '',
    model: typeof prismaVehicle.model === 'string' ? prismaVehicle.model : '',
    year: typeof prismaVehicle.year === 'number' ? prismaVehicle.year : 0,
    vin: typeof prismaVehicle.vin === 'string' ? prismaVehicle.vin : '',
    licensePlate:
      typeof prismaVehicle.licensePlate === 'string'
        ? prismaVehicle.licensePlate
        : undefined,
    unitNumber:
      typeof prismaVehicle.unitNumber === 'string'
        ? prismaVehicle.unitNumber
        : undefined,
    grossVehicleWeight:
      typeof prismaVehicle.grossVehicleWeight === 'number'
        ? prismaVehicle.grossVehicleWeight
        : undefined,
    maxPayload:
      typeof prismaVehicle.maxPayload === 'number'
        ? prismaVehicle.maxPayload
        : undefined,
    fuelType:
      typeof prismaVehicle.fuelType === 'string'
        ? prismaVehicle.fuelType
        : undefined,
    engineType:
      typeof prismaVehicle.engineType === 'string'
        ? prismaVehicle.engineType
        : undefined,
    registrationNumber:
      typeof prismaVehicle.registrationNumber === 'string'
        ? prismaVehicle.registrationNumber
        : undefined,
    registrationExpiry:
      prismaVehicle.registrationExpiration instanceof Date
        ? prismaVehicle.registrationExpiration
        : undefined,
    insuranceProvider:
      typeof prismaVehicle.insuranceProvider === 'string'
        ? prismaVehicle.insuranceProvider
        : undefined,
    insurancePolicyNumber:
      typeof prismaVehicle.insurancePolicyNumber === 'string'
        ? prismaVehicle.insurancePolicyNumber
        : undefined,
    insuranceExpiry:
      prismaVehicle.insuranceExpiration instanceof Date
        ? prismaVehicle.insuranceExpiration
        : undefined,
    currentDriverId:
      typeof prismaVehicle.currentDriverId === 'string'
        ? prismaVehicle.currentDriverId
        : undefined,
    currentLoadId:
      typeof prismaVehicle.currentLoadId === 'string'
        ? prismaVehicle.currentLoadId
        : undefined,
    currentLocation:
      typeof prismaVehicle.currentLocation === 'string'
        ? prismaVehicle.currentLocation
        : undefined,
    totalMileage:
      typeof prismaVehicle.currentOdometer === 'number'
        ? prismaVehicle.currentOdometer
        : undefined,
    lastMaintenanceMileage:
      typeof prismaVehicle.lastMaintenanceMileage === 'number'
        ? prismaVehicle.lastMaintenanceMileage
        : undefined,
    nextMaintenanceDate:
      prismaVehicle.nextMaintenanceDate instanceof Date
        ? prismaVehicle.nextMaintenanceDate
        : undefined,
    nextMaintenanceMileage:
      typeof prismaVehicle.nextMaintenanceMileage === 'number'
        ? prismaVehicle.nextMaintenanceMileage
        : undefined,
    createdAt:
      prismaVehicle.createdAt instanceof Date
        ? prismaVehicle.createdAt
        : new Date(),
    updatedAt:
      prismaVehicle.updatedAt instanceof Date
        ? prismaVehicle.updatedAt
        : new Date(),
    // Relations (optional, set to undefined if not present)
    driver: undefined,
    organization: undefined,
  };
}

export async function createVehicleAction(
  _prevState: VehicleActionResult | null, // Added prevState for useActionState
  formData: FormData // Changed to FormData for useActionState
): Promise<VehicleActionResult> {
  try {
    const { userId, orgId: currentOrgId } = await auth(); // Get orgId from auth
    if (!userId || !currentOrgId) {
      return { success: false, error: 'Unauthorized', data: false };
    }

    // Extract data from FormData
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = VehicleFormSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid form data. Please check the fields.',
        fieldErrors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>,
        data: false,
      };
    }
    const validatedData = validatedFields.data;

    // Check if VIN already exists in the organization
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        vin: validatedData.vin,
        organizationId: currentOrgId, // Use orgId from auth
      },
    });

    if (existingVehicle) {
      return {
        success: false,
        error: 'A vehicle with this VIN already exists',
        fieldErrors: { vin: ['A vehicle with this VIN already exists'] },
        data: false,
      };
    }

    // Map status/type to Prisma
    const vehicleData = {
      ...validatedData,
      organizationId: currentOrgId, // Use orgId from auth
      status: toPrismaVehicleStatus('available'),
      type: validatedData.type,
      unitNumber: validatedData.unitNumber ?? '', // ensure string
      registrationExpiry: validatedData.registrationExpiry
        ? new Date(validatedData.registrationExpiry)
        : null,
      insuranceExpiry: validatedData.insuranceExpiry
        ? new Date(validatedData.insuranceExpiry)
        : null,
      nextMaintenanceDate: validatedData.nextMaintenanceDate
        ? new Date(validatedData.nextMaintenanceDate)
        : null,
      // Ensure numeric fields are numbers or undefined
      year: validatedData.year ? Number(validatedData.year) : new Date().getFullYear(),
      totalMileage: validatedData.totalMileage ? Number(validatedData.totalMileage) : undefined,
      nextMaintenanceMileage: validatedData.nextMaintenanceMileage ? Number(validatedData.nextMaintenanceMileage) : undefined,
      grossVehicleWeight: validatedData.grossVehicleWeight ? Number(validatedData.grossVehicleWeight) : undefined,
      maxPayload: validatedData.maxPayload ? Number(validatedData.maxPayload) : undefined,
    };
    const vehicle = await db.vehicle.create({ data: vehicleData as any }); // Use 'as any' for now, refine Prisma types later

    revalidatePath(`/${currentOrgId}/vehicles`);
    return { success: true, vehicle: toPublicVehicle(vehicle), data: true };
  } catch (error) {
    const result = handleError(error, 'Create Vehicle');
    return { success: false, error: result.error, fieldErrors: (result as any).fieldErrors, data: false };
  }
}

export async function updateVehicleAction(
  prevState: VehicleActionResult | null, // Added prevState for useActionState
  formData: FormData // Changed to FormData for useActionState
): Promise<VehicleActionResult> {
  try {
    const { userId, orgId: currentOrgId } = await auth();
    if (!userId || !currentOrgId) {
      return { success: false, error: 'Unauthorized', data: false };
    }

    const vehicleId = formData.get('vehicleId') as string;
    if (!vehicleId) {
      return { success: false, error: 'Vehicle ID is missing.', data: false };
    }

    // Get existing vehicle to check permissions
    const existingVehicle = await db.vehicle.findUnique({
      where: { id: vehicleId, organizationId: currentOrgId }, // Ensure vehicle belongs to the org
      select: { id: true, organizationId: true, vin: true },
    });

    if (!existingVehicle) {
      return { success: false, error: 'Vehicle not found or you do not have permission to edit it.', data: false };
    }

    // Extract data from FormData
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = VehicleFormSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid form data. Please check the fields.',
        fieldErrors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>,
        data: false,
      };
    }
    const validatedData = validatedFields.data;

    // Check if VIN change conflicts with existing vehicle
    if (validatedData.vin !== existingVehicle.vin) {
      const vinConflict = await db.vehicle.findFirst({
        where: {
          vin: validatedData.vin,
          organizationId: existingVehicle.organizationId,
          id: { not: vehicleId },
        },
      });

      if (vinConflict) {
        return {
          success: false,
          error: 'A vehicle with this VIN already exists',
          fieldErrors: { vin: ['A vehicle with this VIN already exists'] },
          data: false,
        };
      }
    }

    // Map type to Prisma
    const updateData = {
      ...validatedData,
      type: validatedData.type,
      registrationExpiry: validatedData.registrationExpiry
        ? new Date(validatedData.registrationExpiry)
        : null,
      insuranceExpiry: validatedData.insuranceExpiry
        ? new Date(validatedData.insuranceExpiry)
        : null,
      nextMaintenanceDate: validatedData.nextMaintenanceDate
        ? new Date(validatedData.nextMaintenanceDate)
        : null,
      // Ensure numeric fields are numbers or undefined
      year: validatedData.year ? Number(validatedData.year) : new Date().getFullYear(),
      totalMileage: validatedData.totalMileage ? Number(validatedData.totalMileage) : undefined,
      nextMaintenanceMileage: validatedData.nextMaintenanceMileage ? Number(validatedData.nextMaintenanceMileage) : undefined,
      grossVehicleWeight: validatedData.grossVehicleWeight ? Number(validatedData.grossVehicleWeight) : undefined,
      maxPayload: validatedData.maxPayload ? Number(validatedData.maxPayload) : undefined,
    };

    const vehicle = await db.vehicle.update({
      where: { id: vehicleId },
      data: updateData as any, // Use 'as any' for now, refine Prisma types later
    });

    revalidatePath(`/${existingVehicle.organizationId}/vehicles`);
    revalidatePath(
      `/${existingVehicle.organizationId}/vehicles/${vehicleId}`
    );
    return { success: true, vehicle: toPublicVehicle(vehicle), data: true };
  } catch (error) {
    const result = handleError(error, 'Update Vehicle');
    return { success: false, error: result.error, fieldErrors: (result as any).fieldErrors, data: false };
  }
}

export async function updateVehicleStatusAction(
  vehicleId: string,
  data: VehicleUpdateStatusData
): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized', data: false };
    }

    // Get existing vehicle to check permissions
    const existingVehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        organizationId: true,
        status: true,
        make: true,
        model: true,
        vin: true,
      },
    });

    if (!existingVehicle) {
      return { success: false, error: 'Vehicle not found', data: false };
    }

    // Validate input
    const validatedData = VehicleUpdateStatusSchema.parse(data);

    // Update status and notes
    const updatedVehicle = await db.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: toPrismaVehicleStatus(validatedData.status),
        notes: validatedData.notes,
      },
    });

    revalidatePath(`/${existingVehicle.organizationId}/vehicles`);
    revalidatePath(
      `/${existingVehicle.organizationId}/vehicles/${vehicleId}`
    );
    return { success: true, vehicle: toPublicVehicle(updatedVehicle), data: true };
  } catch (error) {
    const result = handleError(error, 'Update Vehicle Status');
    return { success: result.success, error: result.error, fieldErrors: (result as any).fieldErrors, data: false };
  }
}

export async function deleteVehicleAction(
  vehicleId: string
): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized', data: false };
    }

    // Get vehicle to get organizationId for revalidation
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { organizationId: true },
    });

    if (!vehicle) {
      return { success: false, error: 'Vehicle not found', data: false };
    }

    await db.vehicle.delete({
      where: { id: vehicleId },
    });

    revalidatePath(`/${vehicle.organizationId}/vehicles`);
    return { success: true, data: true };
  } catch (error) {
    const result = handleError(error, 'Delete Vehicle');
    return { success: result.success, error: result.error, fieldErrors: (result as any).fieldErrors, data: false };
  }
}

export async function assignVehicleToDriverAction(
  vehicleId: string,
  driverId: string
): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized', data: false };
    }

    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        organizationId: true,
        status: true,
        // currentDriverId: true, // Removed as it's not part of the select type and not used
      },
    });

    if (!vehicle) {
      return { success: false, error: 'Vehicle not found', data: false };
    }

    // Find an active load for this vehicle, or create a new one for assignment
    // (This is a simplified example; real logic may need to check for existing assignments, statuses, etc.)
    const newLoad = await db.load.create({
      data: {
        organizationId: vehicle.organizationId,
        driverId,
        vehicleId,
        loadNumber: `ASSIGN-${Date.now()}`,
        status: 'assigned',
        originAddress: 'Assignment',
        originCity: '',
        originState: '',
        originZip: '',
        destinationAddress: '',
        destinationCity: '',
        destinationState: '',
        destinationZip: '',
      },
    });

    revalidatePath(`/${vehicle.organizationId}/vehicles`);
    revalidatePath(
      `/${vehicle.organizationId}/vehicles/${vehicleId}`
    );

    // Return the vehicle (not the load)
    const updatedVehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
    });
    return {
      success: true,
      vehicle: updatedVehicle ? toPublicVehicle(updatedVehicle) : undefined,
      data: true,
    };
  } catch (error) {
    const result = handleError(error, 'Assign Vehicle To Driver');
    return { success: result.success, error: result.error, fieldErrors: (result as any).fieldErrors, data: false };
  }
}
