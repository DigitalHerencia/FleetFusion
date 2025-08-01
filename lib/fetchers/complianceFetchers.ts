'use server';

import { auth } from '@clerk/nextjs/server';
import type { z } from 'zod';

import { hasPermission } from '@/lib/auth/permissions';
import { calculateHosStatus } from '@/lib/utils/hos';
import { complianceDocumentFilterSchema, hosFilterSchema } from '@/schemas/compliance';
import type { UserContext } from '@/types/auth';
import type { ClerkOrganizationMetadata } from '@/types/auth';

import { unstable_cache } from 'next/cache';
import { CACHE_TTL, getCachedData, setCachedData } from '@/lib/cache/auth-cache';
import prisma from '@/lib/database/db';
import { handleError } from '@/lib/errors/handleError';

import type { HosLog, ComplianceDashboardData } from '@/types/compliance';

// Utility function to create default organization metadata
function createDefaultOrgMetadata(): ClerkOrganizationMetadata {
  return {
    name: 'Default Organization',
    subscriptionTier: 'free',
    subscriptionStatus: 'inactive',
    maxUsers: 5,
    features: [],
    billingEmail: '',
    createdAt: new Date().toISOString(),
    settings: {
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      distanceUnit: 'miles',
      fuelUnit: 'gallons',
    },
  };
}

/**
 * Get compliance dashboard overview data
 */
async function _getComplianceDashboard(organizationId: string): Promise<ComplianceDashboardData> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalDocuments,
      pendingDocuments,
      expiredDocuments,
      expiringDocuments,
      driverCompliance,
      vehicleCompliance,
      inspectionData,
    ] = await Promise.all([
      // Total compliance documents
      prisma.complianceDocument.count({
        where: { organizationId },
      }),

      // Pending documents (null status or pending)
      prisma.complianceDocument.count({
        where: {
          organizationId,
          OR: [{ status: undefined }, { status: 'pending' }],
        },
      }),

      // Expired documents
      prisma.complianceDocument.count({
        where: {
          organizationId,
          expirationDate: {
            lt: today,
          },
        },
      }),

      // Expiring within 30 days
      prisma.complianceDocument.count({
        where: {
          organizationId,
          expirationDate: {
            gte: today,
            lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Driver compliance summary
      prisma.driver.findMany({
        where: {
          organizationId,
          status: 'active',
        },
        include: {
          compliance_documents: {
            select: {
              type: true,
              status: true,
              expirationDate: true,
            },
          },
        },
      }),

      // Vehicle compliance summary
      prisma.vehicle.findMany({
        where: {
          organizationId,
          status: 'active',
        },
        include: {
          complianceDocuments: {
            select: {
              type: true,
              status: true,
              expirationDate: true,
            },
          },
        },
      }),

      // Inspection data
      prisma.vehicle.findMany({
        where: {
          organizationId,
          lastInspectionDate: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          id: true,
          lastInspectionDate: true,
          nextInspectionDue: true,
        },
      }),
    ]);

    // Calculate compliance rates
    const driversInCompliance = driverCompliance.filter((driver) => {
      const requiredDocs = ['license', 'medical_certificate', 'drug_test'];
      return requiredDocs.every((docType) => {
        const doc = driver.compliance_documents.find((d) => d.type === docType);
        return (
          doc &&
          doc.status === 'approved' &&
          (!doc.expirationDate || new Date(doc.expirationDate) > today)
        );
      });
    }).length;

    const vehiclesInCompliance = vehicleCompliance.filter((vehicle) => {
      const requiredDocs = ['registration', 'insurance', 'inspection'];
      return requiredDocs.every((docType) => {
        const doc = vehicle.complianceDocuments.find((d) => d.type === docType);
        return (
          doc &&
          doc.status === 'approved' &&
          (!doc.expirationDate || new Date(doc.expirationDate) > today)
        );
      });
    }).length;

    // Calculate inspection compliance
    const overdueInspections = inspectionData.filter(
      (v) => v.nextInspectionDue && new Date(v.nextInspectionDue) < today,
    ).length;

    const dashboard = {
      totalDocuments,
      pendingDocuments,
      expiredDocuments,
      expiringDocuments,
      driverComplianceRate:
        driverCompliance.length > 0
          ? ((driversInCompliance / driverCompliance.length) * 100).toFixed(1)
          : '100',
      vehicleComplianceRate:
        vehicleCompliance.length > 0
          ? ((vehiclesInCompliance / vehicleCompliance.length) * 100).toFixed(1)
          : '100',
      totalDrivers: driverCompliance.length,
      driversInCompliance,
      totalVehicles: vehicleCompliance.length,
      vehiclesInCompliance,
      recentInspections: inspectionData.length,
      overdueInspections,
      inspectionComplianceRate:
        inspectionData.length > 0
          ? (((inspectionData.length - overdueInspections) / inspectionData.length) * 100).toFixed(
              1,
            )
          : '100',
    };

    return dashboard;
  } catch (error) {
    console.error('Error fetching compliance dashboard:', error);
    throw new Error('Failed to fetch compliance dashboard');
  }
}

export const getComplianceDashboard: (organizationId: string) => Promise<ComplianceDashboardData> =
  unstable_cache(_getComplianceDashboard, ['compliance-dashboard'], {
    revalidate: 300,
    tags: ['compliance', 'dashboard'],
  });

export interface VehicleComplianceRecord {
  id: string;
  unit: string;
  type: string;
  status: string;
  lastInspection: Date | null;
  nextInspection: Date | null;
  defects: string;
  registrationExpiry: Date | null;
}

export interface DriverComplianceRow {
  id: string;
  name: string;
  cdlStatus: string;
  cdlExpiration: Date | null;
  medicalStatus: string;
  medicalExpiration: Date | null;
  hosStatus: string;
  violationStatus: string;
  lastViolation: Date | null;
  lastInspection: Date | null;
}

export interface VehicleComplianceRow {
  id: string;
  unit: string;
  type: string;
  status: string;
  lastInspection: Date | null;
  nextInspection: Date | null;
  defects: string;
  registrationExpiry: Date | null;
}

export async function getDriverComplianceStatuses(
  organizationId: string,
): Promise<DriverComplianceRow[]> {
  try {
    const drivers = await prisma.driver.findMany({
      where: { organizationId, status: 'active' },
      include: {
        compliance_documents: true,
        loads: {
          where: {
            status: {
              in: ['assigned', 'dispatched', 'in_transit', 'at_pickup', 'picked_up', 'en_route'],
            },
          },
          select: {
            vehicle: { select: { lastInspectionDate: true } },
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    const today = new Date();
    const soon = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return Promise.all(
      drivers.map(async (d) => {
        const cdlExp = d.licenseExpiration;
        const medExp = d.medicalCardExpiration;
        const cdlStatus = !cdlExp
          ? 'Valid'
          : cdlExp < today
            ? 'Expired'
            : cdlExp < soon
              ? 'Expiring Soon'
              : 'Valid';
        const medicalStatus = !medExp
          ? 'Valid'
          : medExp < today
            ? 'Expired'
            : medExp < soon
              ? 'Expiring Soon'
              : 'Valid';
        const hos = (await getDriverHOSStatus(d.id, organizationId).catch(() => null)) as any;
        const violationStatus = hos?.data?.complianceStatus ?? 'unknown';
        const lastViolation = hos?.data?.lastLoggedAt ?? null;
        const lastInspection =
          d.loads && d.loads.length > 0 && d.loads[0]?.vehicle
            ? d.loads[0].vehicle.lastInspectionDate
            : null;

        return {
          id: d.id,
          name: `${d.firstName} ${d.lastName}`,
          cdlStatus,
          cdlExpiration: cdlExp,
          medicalStatus,
          medicalExpiration: medExp,
          hosStatus: hos?.data?.currentStatus ?? 'Unknown',
          violationStatus,
          lastViolation,
          lastInspection,
        } as DriverComplianceRow;
      }),
    );
  } catch (error) {
    console.error('Error fetching driver compliance status:', error);
    throw new Error('Failed to fetch driver compliance status');
  }
}

export async function getVehicleComplianceRecords(
  organizationId: string,
): Promise<VehicleComplianceRow[]> {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { organizationId, status: 'active' },
      include: { complianceDocuments: true },
    });

    const today = new Date();
    const soon = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return vehicles.map((v) => {
      const registrationDoc = v.complianceDocuments.find(
        (d) => d.type === 'vehicle_registration' || d.type === 'apportioned_registration',
      );
      const inspectionDoc = v.complianceDocuments.find(
        (d) => d.type === 'annual_inspection' || d.type === 'emission_test',
      );
      const insuranceDoc = v.complianceDocuments.find((d) => d.type === 'vehicle_insurance');

      let status = 'Compliant';
      [registrationDoc, inspectionDoc, insuranceDoc].forEach((doc) => {
        if (!doc) {
          status = 'Non-Compliant';
          return;
        }
        if (doc.expirationDate && doc.expirationDate < today) {
          status = 'Non-Compliant';
          return;
        }
        if (doc.expirationDate && doc.expirationDate < soon && status !== 'Non-Compliant') {
          status = 'Warning';
        }
      });

      return {
        id: v.id,
        unit: v.unitNumber,
        type: v.type,
        status,
        lastInspection: v.lastInspectionDate,
        nextInspection: v.nextInspectionDue,
        defects: 'None',
        registrationExpiry: registrationDoc?.expirationDate ?? v.registrationExpiration ?? null,
      } as VehicleComplianceRow;
    });
  } catch (error) {
    console.error('Error fetching vehicle compliance records:', error);
    throw new Error('Failed to fetch vehicle compliance records');
  }
}

// Document Fetchers
export async function getComplianceDocuments(
  filter: z.infer<typeof complianceDocumentFilterSchema> = {},
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    } // Fix permission check
    const userContext: UserContext = {
      userId,
      organizationId: orgId,
      name: undefined,
      role: 'driver',
      permissions: [],
      email: '',
      isActive: false,
      onboardingComplete: false,
      organizationMetadata: createDefaultOrgMetadata(),
    };
    if (!hasPermission(userContext, 'org:compliance:view_compliance_dashboard')) {
      throw new Error('Insufficient permissions');
    }

    // Validate and parse filter
    const validatedFilter = complianceDocumentFilterSchema.parse(filter);
    const {
      page = 1,
      limit = 20,
      search,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = validatedFilter;

    // Build where clause
    const where: any = {
      organizationId: orgId,
    };

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Execute query with pagination
    const [documents, totalCount] = await Promise.all([
      prisma.complianceDocument.findMany({
        where,
        include: {
          drivers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true,
              make: true,
              model: true,
            },
          },
          verifiedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.complianceDocument.count({ where }),
    ]);

    return {
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching compliance documents:', error);
    return handleError(error, 'Compliance Documents Fetcher');
  }
}
export async function getComplianceDocumentById(documentId: string) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    } // Fix permission check
    const userContext: UserContext = {
      userId,
      organizationId: orgId,
      name: undefined,
      role: 'driver',
      permissions: [],
      email: '',
      isActive: false,
      onboardingComplete: false,
      organizationMetadata: createDefaultOrgMetadata(),
    };
    if (!hasPermission(userContext, 'org:compliance:view_compliance_dashboard')) {
      throw new Error('Insufficient permissions');
    }

    const document = await prisma.complianceDocument.findUnique({
      where: { id: documentId },
      include: {
        drivers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            unitNumber: true,
            make: true,
            model: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return {
      success: true,
      data: document,
    };
  } catch (error) {
    console.error('Error fetching compliance document by ID:', error);
    return handleError(error, 'Compliance Document Fetcher');
  }
}
/**
 * Get compliance documents with pagination and filtering
 * @param filter - Filter options
 * @returns Paginated compliance documents
 **/

export async function getPaginatedComplianceDocuments(
  filter: z.infer<typeof complianceDocumentFilterSchema> = {},
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Fix permission check
    const userContext: UserContext = {
      userId,
      organizationId: orgId,
      name: undefined,
      role: 'driver',
      permissions: [],
      email: '',
      isActive: false,
      onboardingComplete: false,
      organizationMetadata: createDefaultOrgMetadata(),
    };
    if (!hasPermission(userContext, 'org:compliance:view_compliance_dashboard')) {
      throw new Error('Insufficient permissions');
    }

    // Validate and parse filter
    const validatedFilter = complianceDocumentFilterSchema.parse(filter);
    const {
      page = 1,
      limit = 20,
      search,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = validatedFilter;

    // Build where clause
    const where: any = {
      organizationId: orgId,
    };

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Execute query with pagination
    const [documents, totalCount] = await Promise.all([
      prisma.complianceDocument.findMany({
        where,
        include: {
          drivers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true,
              make: true,
              model: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.complianceDocument.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching compliance documents:', error);
    return handleError(error, 'Compliance Document Fetcher');
  }
}

// HOS Fetchers
export async function getHOSLogs(filter: z.infer<typeof hosFilterSchema> = {}) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Fix permission check
    const userContext: UserContext = {
      userId,
      organizationId: orgId,
      name: undefined,
      role: 'driver',
      permissions: [],
      email: '',
      isActive: false,
      onboardingComplete: false,
      organizationMetadata: createDefaultOrgMetadata(),
    };
    if (!hasPermission(userContext, 'org:compliance:view_compliance_dashboard')) {
      throw new Error('Insufficient permissions');
    }

    // Validate and parse filter
    const validatedFilter = hosFilterSchema.parse(filter);
    const {
      page = 1,
      limit = 50,
      driverId,
      startDate,
      endDate,
      sortBy = 'startTime',
      sortOrder = 'desc',
    } = validatedFilter;

    // Build where clause
    const where: any = {
      organizationId: orgId,
    };
    if (driverId) {
      where.driverId = driverId;
    }
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.createdAt = { gte: startDate };
    } else if (endDate) {
      where.createdAt = { lte: endDate };
    }
    // Fetch HOS logs as compliance documents with HOS metadata
    const [hosDocs, totalCount] = await Promise.all([
      prisma.complianceDocument.findMany({
        where: { ...where, type: 'hos_log' },
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          // driverId: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          notes: true,
          verifiedBy: true,
          verifiedAt: true,
          metadata: true,
        },
      }),
      prisma.complianceDocument.count({
        where: { ...where, type: 'hos_log' },
      }),
    ]);
    // Calculate hours-of-service metrics and violations
    const diffMinutes = (s: any, e: any) =>
      Math.max(0, (new Date(e).getTime() - new Date(s).getTime()) / 60000);

    const logs = hosDocs.map((doc) => {
      let totalDriveTime = 0;
      let totalOnDutyTime = 0;
      let totalOffDutyTime = 0;
      let sleeperBerthTime = 0;
      let personalConveyanceTime = 0;
      let yardMovesTime = 0;
      const violations: any[] = [];

      let meta = doc.metadata;
      if (typeof meta === 'string') {
        try {
          meta = JSON.parse(meta);
        } catch {
          meta = {};
        }
      }

      const entries =
        meta && typeof meta === 'object' && !Array.isArray(meta)
          ? Array.isArray((meta as any).logs)
            ? (meta as any).logs
            : Array.isArray((meta as any).timeRecords)
              ? (meta as any).timeRecords
              : []
          : [];

      for (const entry of entries) {
        const mins = diffMinutes(entry.startTime, entry.endTime);
        switch (entry.status) {
          case 'driving':
            totalDriveTime += mins;
            totalOnDutyTime += mins;
            break;
          case 'on_duty':
            totalOnDutyTime += mins;
            break;
          case 'off_duty':
            totalOffDutyTime += mins;
            break;
          case 'sleeper_berth':
            sleeperBerthTime += mins;
            break;
          case 'personal_conveyance':
            personalConveyanceTime += mins;
            break;
          case 'yard_moves':
            yardMovesTime += mins;
            totalOnDutyTime += mins;
            break;
        }
      }

      if (totalDriveTime > 11 * 60) {
        violations.push({
          type: '11_hour',
          description: 'Exceeded 11-hour driving limit',
        });
      }
      if (totalOnDutyTime > 14 * 60) {
        violations.push({
          type: '14_hour',
          description: 'Exceeded 14-hour on-duty limit',
        });
      }

      return {
        id: doc.id,
        date: doc.createdAt,
        status: doc.status as 'compliant' | 'violation' | 'pending_review',
        totalDriveTime,
        totalOnDutyTime,
        totalOffDutyTime,
        sleeperBerthTime,
        personalConveyanceTime,
        yardMovesTime,
        violations,
        certifiedBy: doc.verifiedBy,
        certifiedAt: doc.verifiedAt,
        notes: doc.notes,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });
    const totalPages = Math.ceil(totalCount / limit);
    return {
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching HOS logs:', error);
    return handleError(error, 'HOS Logs Fetcher');
  }
}

/**
 * Get HOS status for a specific driver
 */
export async function getDriverHOSStatus(driverId: string, organizationId?: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // If organizationId is not provided, we need to get it from the context
    // This should be passed by the calling component
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const cacheKey = `hos:status:${organizationId}:${driverId}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    const today = new Date();
    const eightDaysAgo = new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000);

    // Get recent HOS logs for the driver
    const recentLogs = await prisma.complianceDocument.findMany({
      where: {
        organizationId: organizationId,
        type: 'hos_log',
        createdAt: {
          gte: eightDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
    // Convert metadata to HosLog objects
    const hosLogs: HosLog[] = recentLogs.map((doc) => {
      let meta: any = doc.metadata;
      if (typeof meta === 'string') {
        try {
          meta = JSON.parse(meta);
        } catch {
          meta = {};
        }
      }
      return {
        ...(meta as any),
        id: doc.id,
        tenantId: organizationId,
        driverId,
        date: doc.createdAt,
        status: doc.status as any,
      } as HosLog;
    });

    const hosStatus = calculateHosStatus(driverId, hosLogs);
    setCachedData(cacheKey, hosStatus, CACHE_TTL.SHORT);
    return {
      success: true,
      data: hosStatus,
    };
  } catch (error) {
    console.error('Error fetching driver HOS status:', error);
    return handleError(error, 'Driver HOS Status Fetcher');
  }
}

/**
 * Get HOS violations for organization
 */
export async function getHOSViolations(
  organizationId: string,
  options: {
    severity?: string[]; // Keep severity as it's used in the where clause setup
    resolved?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    page?: number;
  } = {},
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const {
      severity = ['minor', 'major', 'critical'],
      resolved = false,
      startDate,
      endDate,
      limit = 50,
      page = 1,
    } = options;

    const where: any = {
      organizationId,
      type: 'hos_violation',
      status: resolved ? 'resolved' : { not: 'resolved' },
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // For now, use compliance documents as proxy for violations
    const [violations, totalCount] = await Promise.all([
      prisma.complianceDocument.findMany({
        where: {
          organizationId,
          type: 'hos_log',
          status: 'pending', // Pending could indicate violations
        },
        include: {
          drivers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: (page - 1) * limit,
      }),

      prisma.complianceDocument.count({
        where: {
          organizationId,
          type: 'hos_log',
          status: 'pending',
        },
      }),
    ]);

    const transformedViolations = violations.map((doc) => {
      let driver: { id: string; name: string } | null = null;
      if (Array.isArray(doc.drivers) && doc.drivers.length > 0) {
        driver = {
          id: doc.drivers[0].id,
          name: `${doc.drivers[0].firstName} ${doc.drivers[0].lastName}`,
        };
      }
      return {
        id: doc.id,
        type: 'other' as const,
        description: doc.notes || 'HOS compliance review required',
        severity: 'minor' as const,
        timestamp: doc.createdAt,
        resolved: false,
        driver,
        status: 'open' as const,
      };
    });

    return {
      success: true,
      data: {
        violations: transformedViolations,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching HOS violations:', error);
    return handleError(error, 'HOS Violations Fetcher');
  }
}

// --- Compliance Alerts Fetchers ---
export async function getComplianceAlerts(
  organizationId: string,
  filter: Partial<{
    type: string;
    severity: string;
    entityType: string;
    entityId: string;
    acknowledged: boolean;
    resolved: boolean;
    page: number;
    limit: number;
  }> = {},
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');
    const {
      type,
      severity,
      entityType,
      entityId,
      acknowledged,
      resolved,
      page = 1,
      limit = 50,
    } = filter;
    const where: any = { organizationId };
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (acknowledged !== undefined) where.acknowledged = acknowledged;
    if (resolved !== undefined) where.resolved = resolved;
    const [alerts, total] = await Promise.all([
      prisma.complianceAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.complianceAlert.count({ where }),
    ]);
    return {
      success: true,
      data: {
        alerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    return handleError(error, 'Compliance Alerts Fetcher');
  }
}

// --- Expiring Document Fetcher ---
export async function getExpiringDocuments(organizationId: string, daysAhead = 30) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const today = new Date();
    const dueDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const documents = await prisma.complianceDocument.findMany({
      where: {
        organizationId,
        expirationDate: {
          gte: today,
          lte: dueDate,
        },
      },
      include: {
        drivers: {
          select: { id: true, firstName: true, lastName: true },
        },
        vehicle: { select: { id: true, unitNumber: true } },
      },
      orderBy: { expirationDate: 'asc' },
    });

    return { success: true, data: documents };
  } catch (error) {
    console.error('Error fetching expiring documents:', error);
    return handleError(error, 'Expiring Documents Fetcher');
  }
}

// --- Audit Log Fetchers ---
export async function getAuditLogs(organizationId: string, entityType?: string, entityId?: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');
    const where: any = { organizationId };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    return { success: true, data: logs };
  } catch (error) {
    return handleError(error, 'Audit Log Fetcher');
  }
}

// --- Improved HOS Log Calculation ---
// (Replace TODOs in getHOSLogs with actual calculations if HOS entries are available)

export async function getDOTInspections(organizationId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const vehicles = await prisma.vehicle.findMany({
      where: { organizationId },
      select: {
        id: true,
        unitNumber: true,
        lastInspectionDate: true,
        nextInspectionDue: true,
      },
      orderBy: { unitNumber: 'asc' },
    });

    const inspections = vehicles.map((v) => ({
      id: v.id,
      vehicleId: v.id,
      vehicleUnit: v.unitNumber ?? '',
      inspectionType: 'annual' as const,
      status:
        v.nextInspectionDue && new Date(v.nextInspectionDue) < new Date() ? 'overdue' : 'completed',
      scheduledDate: v.nextInspectionDue ?? undefined,
      completedDate: v.lastInspectionDate ?? undefined,
      inspector: undefined,
      location: undefined,
      violations: 0,
    }));

    return { success: true, data: inspections };
  } catch (error) {
    return handleError(error, 'DOT Inspections Fetcher');
  }
}
