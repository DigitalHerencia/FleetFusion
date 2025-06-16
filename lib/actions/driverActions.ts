'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { handleError } from '@/lib/errors/handleError';

import type {
  Driver,
  DriverFormData,
  DriverUpdateData,
  DriverActionResult,
  DriverBulkActionResult,
} from '@/types/drivers';
import db from '@/lib/database/db';
import { logAuditEvent } from '@/lib/actions/auditActions';
import {
  driverFormSchema,
  driverUpdateSchema,
  driverStatusUpdateSchema,
  driverAssignmentSchema,
  driverBulkUpdateSchema,
} from '@/schemas/drivers';

// ================== Core CRUD Operations ==================

/**
 * Create a new driver
 */
export async function createDriverAction(
  tenantId: string,
  data: DriverFormData
): Promise<DriverActionResult> {
  const parsed = driverFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      };
    }

    // Validate input data
    const validatedData = driverFormSchema.parse(data);
    
    // Check for duplicate CDL number within tenant
    const existingDriver = await db.driver.findFirst({
      where: {
        organizationId: tenantId,
        licenseNumber: validatedData.cdlNumber,
        status: {
          not: 'terminated',
        },
      },
    });

    if (existingDriver) {
      return {
        success: false,
        error: 'A driver with this CDL number already exists',
        code: 'DUPLICATE_CDL',
      };
    }

    // Check for duplicate email within tenant
    const existingEmail = await db.driver.findFirst({
      where: {
        organizationId: tenantId,
        email: validatedData.email,
        status: {
          not: 'terminated',
        },
      },
    });

    if (existingEmail) {
      return {
        success: false,
        error: 'A driver with this email already exists',
        code: 'DUPLICATE_EMAIL',
      };
    }

    // Create driver record with proper Prisma schema mapping
    const newDriver = await db.driver.create({
      data: {
        organizationId: tenantId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        employeeId: validatedData.employeeId || null,
        hireDate: validatedData.hireDate,
        licenseNumber: validatedData.cdlNumber,
        licenseState: validatedData.cdlState,
        licenseClass: validatedData.cdlClass,
        licenseExpiration: validatedData.cdlExpiration,
        medicalCardExpiration: validatedData.medicalCardExpiration,
        status: 'active',
        emergencyContact1: validatedData.emergencyContact?.name || null,
        emergencyContact2: validatedData.emergencyContact?.phone || null,
        notes: validatedData.notes || null,
        customFields: {
          tags: validatedData.tags || [],
          emergencyContact: validatedData.emergencyContact || null,
        },
      },
    });

    if (!newDriver) {
      return {
        success: false,
        error: 'Failed to create driver',
        code: 'CREATE_FAILED',
      };
    }

    await logAuditEvent('driver.created', 'driver', newDriver.id, {
      driverName: `${newDriver.firstName} ${newDriver.lastName}`,
      cdlNumber: newDriver.licenseNumber,
    });
    revalidatePath(`/dashboard/${tenantId}/drivers`);

    return {
      success: true,
      data: newDriver as unknown as Driver,
    };
  } catch (error) {
    return handleError(error, 'Create Driver');
  }
}

/**
 * Update an existing driver
 */
export async function updateDriverAction(
  driverId: string,
  data: DriverUpdateData
): Promise<DriverActionResult> {
  const parsed = driverUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      };
    }

    // Get existing driver to check permissions
    const existingDriver = await db.driver.findUnique({
      where: { id: driverId },
    });

    if (!existingDriver) {
      return { success: false, error: 'Driver not found', code: 'NOT_FOUND' };
    }

    // Validate input data
    const validatedData = driverUpdateSchema.parse(data);

    // Prepare update object with proper Prisma field mapping
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Direct field mappings to Prisma Driver schema
    if (validatedData.phone !== undefined)
      updateData.phone = validatedData.phone;
    if (validatedData.notes !== undefined)
      updateData.notes = validatedData.notes;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;
    if (validatedData.cdlExpiration !== undefined)
      updateData.licenseExpiration = validatedData.cdlExpiration;
    if (validatedData.medicalCardExpiration !== undefined)
      updateData.medicalCardExpiration = validatedData.medicalCardExpiration;

    // Handle address - convert object to string if needed
    if (validatedData.address !== undefined) {
      if (typeof validatedData.address === 'string') {
        updateData.address = validatedData.address;
      } else if (validatedData.address && typeof validatedData.address === 'object') {
        // Convert address object to formatted string
        const addressParts = [
          validatedData.address.street,
          validatedData.address.city,
          `${validatedData.address.state || ''} ${validatedData.address.zipCode }`.trim()
        ].filter(Boolean);
        updateData.address = addressParts.join(', ');
      } else {
        updateData.address = null;
      }
    }

    // Store complex fields in customFields JSON
    const existingCustomFields = (existingDriver.customFields as any) || {};
    const customFieldsUpdate: any = { ...existingCustomFields };
    
    if (validatedData.endorsements !== undefined)
      customFieldsUpdate.endorsements = validatedData.endorsements;
    if (validatedData.restrictions !== undefined)
      customFieldsUpdate.restrictions = validatedData.restrictions;
    if (validatedData.emergencyContact !== undefined)
      customFieldsUpdate.emergencyContact = validatedData.emergencyContact;
    if (validatedData.tags !== undefined)
      customFieldsUpdate.tags = validatedData.tags;
    if (validatedData.payRate !== undefined)
      customFieldsUpdate.payRate = validatedData.payRate;
    if (validatedData.payType !== undefined)
      customFieldsUpdate.payType = validatedData.payType;
    if (validatedData.homeTerminal !== undefined)
      customFieldsUpdate.homeTerminal = validatedData.homeTerminal;
    if (validatedData.availabilityStatus !== undefined)
      customFieldsUpdate.availabilityStatus = validatedData.availabilityStatus;
    
    updateData.customFields = customFieldsUpdate;

    // Update driver
    const updatedDriver = await db.driver.update({
      where: { id: driverId },
      data: updateData,
    });

    if (!updatedDriver) {
      return {
        success: false,
        error: 'Failed to update driver',
        code: 'UPDATE_FAILED',
      };
    }

    await logAuditEvent('driver.updated', 'driver', driverId, {
      updatedFields: Object.keys(updateData).filter(
        key => key !== 'updatedAt'
      ),
    });
    return {
      success: true,
      data: updatedDriver as unknown as Driver,
    };
  } catch (error) {
    return handleError(error, 'Update Driver');
  }
}

/**
 * Delete (deactivate) a driver
 */
export async function deleteDriverAction(
  driverId: string
): Promise<DriverActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      };
    }

    // Get existing driver to check permissions
    const existingDriver = await db.driver.findUnique({
      where: { id: driverId },
    });

    if (!existingDriver) {
      return { success: false, error: 'Driver not found', code: 'NOT_FOUND' };
    }

    // Soft delete (deactivate) driver
    const deletedDriver = await db.driver.update({
      where: { id: driverId },
      data: {
        status: 'terminated',
        terminationDate: new Date(),
        updatedAt: new Date(),
      },
    });

    if (!deletedDriver) {
      return {
        success: false,
        error: 'Failed to delete driver',
        code: 'DELETE_FAILED',
      };
    }

    await logAuditEvent('driver.deleted', 'driver', driverId);

    return { success: true };
  } catch (error) {
    return handleError(error, 'Delete Driver');
  }
}

// ================== Status Management ==================

/**
 * Update driver status
 */
export async function updateDriverStatusAction(
  driverId: string,
  statusUpdate: z.infer<typeof driverStatusUpdateSchema>
): Promise<DriverActionResult> {
  const parsed = driverStatusUpdateSchema.safeParse(statusUpdate);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      };
    }

    // Get existing driver
    const existingDriver = await db.driver.findUnique({
      where: { id: driverId },
    });

    if (!existingDriver) {
      return { success: false, error: 'Driver not found', code: 'NOT_FOUND' };
    }

    // Validate input
    const validatedData = driverStatusUpdateSchema.parse(statusUpdate);

    // Prepare customFields update with location and availability status
    const existingCustomFields = (existingDriver.customFields as any) || {};
    const customFieldsUpdate: any = { ...existingCustomFields };
    
    if (validatedData.availabilityStatus) {
      customFieldsUpdate.availabilityStatus = validatedData.availabilityStatus;
    }
    
    if (validatedData.location) {
      customFieldsUpdate.currentLocation = validatedData.location;
    }

    // Update driver status
    const updateData: any = {
      status: validatedData.status,
      updatedAt: new Date(),
      customFields: customFieldsUpdate,
    };

    const updatedDriver = await db.driver.update({
      where: { id: driverId },
      data: updateData,
    });

    await logAuditEvent('driver.statusUpdated', 'driver', driverId, {
      status: validatedData.status,
      availabilityStatus: validatedData.availabilityStatus,
    });
    return {
      success: true,
      data: updatedDriver as unknown as Driver,
    };
  } catch (error) {
    return handleError(error, 'Update Driver Status');
  }
}

// ================== Bulk Operations ==================

/**
 * Bulk update drivers
 */
export async function bulkUpdateDriversAction(
  bulkUpdate: z.infer<typeof driverBulkUpdateSchema>
): Promise<DriverBulkActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        processed: 0,
        succeeded: 0,
        failed: bulkUpdate.driverIds.length,
        errors: bulkUpdate.driverIds.map(id => ({
          driverId: id,
          error: 'Authentication required',
        })),
      };
    }

    // Validate input
    const validatedData = driverBulkUpdateSchema.parse(bulkUpdate);

    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ driverId: string; error: string }> = [];

    // Process each driver
    for (const driverId of validatedData.driverIds) {
      try {
        // Get driver to check permissions
        const driver = await db.driver.findUnique({
          where: { id: driverId },
        });

        if (!driver) {
          errors.push({ driverId, error: 'Driver not found' });
          failed++;
          continue;
        }

        // Prepare update with proper customFields handling
        const existingCustomFields = (driver.customFields as any) || {};
        const customFieldsUpdate: any = { ...existingCustomFields };

        const updateData: any = {
          updatedAt: new Date(),
        };

        if (validatedData.updates.status)
          updateData.status = validatedData.updates.status;
        if (validatedData.updates.availabilityStatus)
          customFieldsUpdate.availabilityStatus = validatedData.updates.availabilityStatus;
        if (validatedData.updates.homeTerminal)
          customFieldsUpdate.homeTerminal = validatedData.updates.homeTerminal;
        if (validatedData.updates.tags)
          customFieldsUpdate.tags = validatedData.updates.tags;

        updateData.customFields = customFieldsUpdate;

        // Update driver
        await db.driver.update({
          where: { id: driverId },
          data: updateData,
        });

        succeeded++;
      } catch (error) {
        handleError(error, `Bulk Update Driver ${driverId}`);
        errors.push({ driverId, error: 'Update failed' });
        failed++;
      }
    }

    return {
      success: succeeded > 0,
      processed: validatedData.driverIds.length,
      succeeded,
      failed,
      errors,
    };
  } catch (error) {
    handleError(error, 'Bulk Update Drivers');
    return {
      success: false,
      processed: bulkUpdate.driverIds.length,
      succeeded: 0,
      failed: bulkUpdate.driverIds.length,
      errors: bulkUpdate.driverIds.map(id => ({
        driverId: id,
        error: 'Internal error',
      })),
    };
  }
}

// ================== Assignment Management ==================

/**
 * Assign driver to a load/vehicle
 */
export async function assignDriverAction(
  assignmentData: z.infer<typeof driverAssignmentSchema>
): Promise<DriverActionResult> {
  const parsed = driverAssignmentSchema.safeParse(assignmentData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    };
  }
  const {
    driverId,
    loadId,
    vehicleId,
    trailerId,
    assignmentType,
    scheduledStart,
    scheduledEnd,
    instructions,
    priority,
  } = parsed.data;

  try {
    await db.$transaction(async tx => {
      if (loadId) {
        await tx.load.update({
          where: { id: loadId },
          data: {
            driverId,
            vehicleId: vehicleId || null,
            trailerId: trailerId || null,
            updatedAt: new Date(),
            lastModifiedBy: userId,
          },
        });

        await tx.loadStatusEvent.create({
          data: {
            loadId,
            status: 'assigned',
            timestamp: new Date(),
            notes: instructions || 'Driver assigned',
            automaticUpdate: false,
            source: 'dispatcher',
          },
        });
      }

      await tx.driver.update({
        where: { id: driverId },
        data: { updatedAt: new Date() },
      });
    });

    await logAuditEvent('driver.assigned', 'driver', driverId, {
      loadId,
      vehicleId,
      trailerId,
      assignmentType,
      scheduledStart,
      scheduledEnd,
      priority,
    });

    revalidatePath('/[orgId]/drivers', 'page');
    revalidatePath('/[orgId]/dispatch', 'page');

    return { success: true };
  } catch (error) {
    return handleError(error, 'Assign Driver');
  }
}

/**
 * Unassign driver from current assignment
 */
export async function unassignDriverAction(
  driverId: string
): Promise<DriverActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      };
    }

    // Get driver with current assignments
    const driver = await db.driver.findUnique({
      where: { id: driverId },
      include: {
        loads: {
          where: {
            status: {
              in: [
                'assigned',
                'dispatched',
                'in_transit',
                'at_pickup',
                'picked_up',
                'en_route',
              ] as any[], // Ensure this is an array of the correct enum type
            },
          },
        },
      },
    });

    if (!driver) {
      return { success: false, error: 'Driver not found', code: 'NOT_FOUND' };
    }

    // Check if driver has any active assignments
    if (driver.loads.length === 0) {
      return {
        success: false,
        error: 'Driver has no active assignments to unassign',
        code: 'NO_ASSIGNMENT',
      };
    }

    // Start database transaction for unassignment
    await db.$transaction(async tx => {
      const updates: Promise<unknown>[] = [];

      // Unassign from all active loads
      for (const load of driver.loads) {
        // Update load to remove driver assignment
        updates.push(
          tx.load.update({
            where: { id: load.id },
            data: {
              driverId: null,
              status: load.status === 'assigned' ? 'pending' : load.status,
              updatedAt: new Date(),
            },
          })
        );

        // Create load status event
        updates.push(
          tx.loadStatusEvent.create({
            data: {
              loadId: load.id,
              status: load.status === 'assigned' ? 'pending' : load.status,
              timestamp: new Date(),
              notes: `Driver unassigned: ${driver.firstName} ${driver.lastName}`,
              automaticUpdate: false,
              source: 'dispatcher',
            },
          })
        );
      }

      // Update driver's last modification time (don't change base status)
      updates.push(
        tx.driver.update({
          where: { id: driverId },
          data: {
            updatedAt: new Date(),
          },
        })
      );

      // Execute all updates
      await Promise.all(updates);
    });

    // Log audit event
    await logAuditEvent('driver.unassigned', 'driver', driverId, {
      loadIds: driver.loads.map(l => l.id),
      unassignedBy: userId,
    });

    // Revalidate related pages
    revalidatePath('/[orgId]/drivers', 'page');
    revalidatePath('/[orgId]/dispatch', 'page');

    return { success: true };
  } catch (error) {
    return handleError(error, 'Unassign Driver');
  }
}
