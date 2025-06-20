'use server';

import { auth } from '@clerk/nextjs/server';

import
  {
    CACHE_TTL,
    getCachedData,
    setCachedData,
  } from '@/lib/cache/auth-cache';
import db from '@/lib/database/db';

import type { IftaJurisdictionSummary, IftaPeriodData } from "@/types/ifta";
/**
 * Check user access to organization
 */
async function checkUserAccess(organizationId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { organizationId: true, role: true },
  });

  if (!user?.organizationId || user.organizationId !== organizationId) {
    throw new Error('Access denied');
  }

  return user;
}
/**
 * Get IFTA data for a specific period
 */
export async function getIftaDataForPeriod(
  orgId: string,
  quarter: string,
  year: string
): Promise<IftaPeriodData> {
  try {
    await checkUserAccess(orgId);

    const quarterNum = parseInt(quarter.replace('Q', ''));
    const yearNum = parseInt(year);

    if (
      isNaN(quarterNum) ||
      isNaN(yearNum) ||
      quarterNum < 1 ||
      quarterNum > 4
    ) {
      throw new Error('Invalid quarter or year format');
    }

    const cacheKey = `ifta:${orgId}:${year}:Q${quarterNum}`;

    // Check cache first
    const cached = getCachedData(cacheKey) as IftaPeriodData | null;
    if (
      cached &&
      typeof cached === 'object' &&
      'period' in cached &&
      'summary' in cached &&
      'trips' in cached &&
      'fuelPurchases' in cached &&
      'jurisdictionSummary' in cached &&
      'report' in cached
    ) {
      return cached;
    }

    // Calculate date range for the quarter
    const startMonth = (quarterNum - 1) * 3;
    const startDate = new Date(yearNum, startMonth, 1);
    const endDate = new Date(yearNum, startMonth + 3, 0, 23, 59, 59);

    // Get trip data for the period
    const trips = await db.iftaTrip.findMany({
      where: {
        organizationId: orgId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            unitNumber: true,
            make: true,
            model: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Get fuel purchase data for the period
    const fuelPurchases = await db.iftaFuelPurchase.findMany({
      where: {
        organizationId: orgId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            unitNumber: true,
            make: true,
            model: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate summary statistics
    const totalMiles = trips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalGallons = fuelPurchases.reduce(
      (sum, purchase) => sum + Number(purchase.gallons),
      0
    );
    const averageMpg = totalGallons > 0 ? totalMiles / totalGallons : 0;
    const totalFuelCost = fuelPurchases.reduce(
      (sum, purchase) => sum + Number(purchase.amount),
      0
    );    // Group by jurisdiction
    const jurisdictionSummary = trips.reduce(
      (acc, trip) => {
        const jurisdiction = trip.jurisdiction;
        if (!acc[jurisdiction]) {
          acc[jurisdiction] = {
            jurisdiction,
            totalMiles: 0,
            taxableMiles: 0,
            taxableGallons: 0,
            taxRate: 0,
            taxDue: 0,
            taxPaid: 0,
            netTaxDue: 0,
            miles: 0,
            fuelGallons: 0,
          };
        }
        acc[jurisdiction].miles = (acc[jurisdiction].miles || 0) + trip.distance;
        acc[jurisdiction].totalMiles = (acc[jurisdiction].totalMiles || 0) + trip.distance;
        acc[jurisdiction].taxableMiles = (acc[jurisdiction].taxableMiles || 0) + trip.distance;
        return acc;
      },
      {} as Record<string, IftaJurisdictionSummary>
    );

    // Add fuel data to jurisdiction summary
    fuelPurchases.forEach(purchase => {
      const jurisdiction = purchase.jurisdiction;
      if (jurisdictionSummary[jurisdiction]) {
        const gallons = Number(purchase.gallons);
        jurisdictionSummary[jurisdiction].fuelGallons = (jurisdictionSummary[jurisdiction].fuelGallons || 0) + gallons;
        jurisdictionSummary[jurisdiction].taxableGallons = (jurisdictionSummary[jurisdiction].taxableGallons || 0) + gallons;
      }
    });

    // Check for existing IFTA report for this period
    const existingReport = await db.iftaReport.findFirst({
      where: {
        organizationId: orgId,
        quarter: quarterNum,
        year: yearNum,
      },
    });

    const result: IftaPeriodData = {
      period: { quarter: quarterNum, year: yearNum },
      summary: {
        totalMiles,
        totalGallons,
        averageMpg: Math.round(averageMpg * 100) / 100,
        totalFuelCost,
      },      trips: trips.map(trip => ({
        id: trip.id,
        date: trip.date,
        vehicleId: trip.vehicleId,
        vehicle: {
          id: trip.vehicle.id,
          unitNumber: trip.vehicle.unitNumber,
          make: trip.vehicle.make || 'Unknown',
          model: trip.vehicle.model || 'Unknown',
        },
        jurisdiction: trip.jurisdiction,
        distance: trip.distance,
        fuelUsed: trip.fuelUsed ? Number(trip.fuelUsed) : null,
        notes: trip.notes,
        // Additional fields for table compatibility
        driver: 'Driver Name', // TODO: Add proper driver lookup
        startLocation: 'Start Location', // TODO: Add proper location data
        endLocation: 'End Location', // TODO: Add proper location data
        miles: trip.distance,
        gallons: trip.fuelUsed ? Number(trip.fuelUsed) : 0,
        state: trip.jurisdiction,
      })),fuelPurchases: fuelPurchases.map(purchase => ({
        id: purchase.id,
        date: purchase.date,
        vehicleId: purchase.vehicleId,
        vehicle: {
          id: purchase.vehicle.id,
          unitNumber: purchase.vehicle.unitNumber,
          make: purchase.vehicle.make || 'Unknown',
          model: purchase.vehicle.model || 'Unknown',
        },
        jurisdiction: purchase.jurisdiction,
        gallons: Number(purchase.gallons),
        amount: Number(purchase.amount),
        vendor: purchase.vendor,
        receiptNumber: purchase.receiptNumber,
        notes: purchase.notes,
      })),
      jurisdictionSummary: Object.values(jurisdictionSummary),
      report: existingReport
        ? {
            id: existingReport.id,
            status: existingReport.status,
            submittedAt: existingReport.submittedAt,
            dueDate: existingReport.dueDate,
          }
        : null,
    };

    // Cache the result for 1 hour
    setCachedData(cacheKey, result, CACHE_TTL.SHORT);

    return result;
  } catch (error) {
    console.error('Error fetching IFTA data:', error);
    throw new Error('Failed to fetch IFTA data');
  }
}

/**
 * Get IFTA trip data with filters
 */
export async function getIftaTripData(
  orgId: string,
  filters: {
    vehicleId?: string;
    driverId?: string;
    startDate?: string;
    endDate?: string;
    jurisdiction?: string;
  } = {}
) {
  try {
    await checkUserAccess(orgId);

    const where: any = {
      organizationId: orgId,
    };

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }

    if (filters.jurisdiction) {
      where.jurisdiction = filters.jurisdiction;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const trips = await db.iftaTrip.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            unitNumber: true,
            make: true,
            model: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      success: true,
      data: trips.map(trip => ({
        id: trip.id,
        date: trip.date,
        vehicleId: trip.vehicleId,
        vehicle: trip.vehicle,
        jurisdiction: trip.jurisdiction,
        distance: trip.distance,
        fuelUsed: trip.fuelUsed ? Number(trip.fuelUsed) : null,
        notes: trip.notes,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
      })),
    };
  } catch (error) {
    console.error('Error fetching IFTA trip data:', error);
    throw new Error('Failed to fetch IFTA trip data');
  }
}

/**
 * Get IFTA fuel purchase data with filters
 */
export async function getIftaFuelPurchases(
  orgId: string,
  filters: {
    vehicleId?: string;
    startDate?: string;
    endDate?: string;
    jurisdiction?: string;
  } = {}
) {
  try {
    await checkUserAccess(orgId);

    const where: any = {
      organizationId: orgId,
    };

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }

    if (filters.jurisdiction) {
      where.jurisdiction = filters.jurisdiction;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const purchases = await db.iftaFuelPurchase.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            unitNumber: true,
            make: true,
            model: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      success: true,
      data: purchases.map(purchase => ({
        id: purchase.id,
        date: purchase.date,
        vehicleId: purchase.vehicleId,
        vehicle: purchase.vehicle,
        jurisdiction: purchase.jurisdiction,
        gallons: Number(purchase.gallons),
        amount: Number(purchase.amount),
        vendor: purchase.vendor,
        receiptNumber: purchase.receiptNumber,
        notes: purchase.notes,
        createdAt: purchase.createdAt,
        updatedAt: purchase.updatedAt,
      })),
    };
  } catch (error) {
    console.error('Error fetching IFTA fuel purchases:', error);
    throw new Error('Failed to fetch IFTA fuel purchases');
  }
}

/**
 * Get IFTA reports for organization
 */
export async function getIftaReports(orgId: string, year?: number) {
  try {
    await checkUserAccess(orgId);

    const where: any = {
      organizationId: orgId,
    };

    if (year) {
      where.year = year;
    }

    const reports = await db.iftaReport.findMany({
      where,
      include: {
        submittedByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
    });

    return {
      success: true,
      data: reports.map(report => ({
        id: report.id,
        quarter: report.quarter,
        year: report.year,
        status: report.status,
        totalMiles: report.totalMiles,
        totalGallons: report.totalGallons ? Number(report.totalGallons) : null,
        totalTaxOwed: report.totalTaxOwed ? Number(report.totalTaxOwed) : null,
        totalTaxPaid: report.totalTaxPaid ? Number(report.totalTaxPaid) : null,
        submittedAt: report.submittedAt,
        submittedBy: report.submittedByUser,
        dueDate: report.dueDate,
        filedDate: report.filedDate,
        reportFileUrl: report.reportFileUrl,
        notes: report.notes,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      })),
    };
  } catch (error) {
    console.error('Error fetching IFTA reports:', error);
    throw new Error('Failed to fetch IFTA reports');
  }
}

// -------------------- Tax Calculation Fetchers --------------------

/**
 * Get current jurisdiction tax rates from database
 * Falls back to default rates if database rates are not available
 */
export async function getJurisdictionRates(orgId?: string): Promise<Record<string, number>> {
  try {
    if (orgId) {
      await checkUserAccess(orgId);
    }    // Try to get rates from database (TODO: Add jurisdictionTaxRate model)
    // const currentDate = new Date();
    // const dbRates = await db.jurisdictionTaxRate.findMany({
    const dbRates: any[] = []; // Temporary empty array until model is implemented
    const currentDate = new Date();
    // const dbRatesQuery = {      //   where: {
      //     OR: [
      //       {
      //         AND: [
      //           { organizationId: orgId },
      //           {
      //             effectiveDate: { lte: currentDate },
      //             OR: [
      //               { endDate: null },
      //               { endDate: { gte: currentDate } },
      //             ],
      //           },
      //         ],
      //       },
      //       {
      //         AND: [
      //           { organizationId: undefined }, // Global rates
      //           {
      //             effectiveDate: { lte: currentDate },
      //             OR: [
      //               { endDate: null },
      //               { endDate: { gte: currentDate } },
      //             ],
      //           },
      //         ],
      //       },
      //     ],
      //   },
      //   orderBy: [
      //     { organizationId: 'desc' }, // Org-specific rates take precedence
      //     { effectiveDate: 'desc' },
      //   ],
      // });

    // Convert to jurisdiction -> rate mapping
    const rates: Record<string, number> = {};
    dbRates.forEach((rate: any) => {
      if (!rates[rate.jurisdiction]) {
        rates[rate.jurisdiction] = Number(rate.taxRate);
      }
    });

    // Add default fallback rates for common jurisdictions
    const defaultRates = {
      AL: 0.19,    // Alabama
      AK: 0.08,    // Alaska
      AZ: 0.18,    // Arizona
      AR: 0.225,   // Arkansas
      CA: 0.387,   // California
      CO: 0.205,   // Colorado
      CT: 0.25,    // Connecticut
      DE: 0.23,    // Delaware
      FL: 0.205,   // Florida
      GA: 0.184,   // Georgia
      HI: 0.16,    // Hawaii
      ID: 0.25,    // Idaho
      IL: 0.398,   // Illinois
      IN: 0.16,    // Indiana
      IA: 0.30,    // Iowa
      KS: 0.24,    // Kansas
      KY: 0.183,   // Kentucky
      LA: 0.16,    // Louisiana
      ME: 0.253,   // Maine
      MD: 0.243,   // Maryland
      MA: 0.21,    // Massachusetts
      MI: 0.255,   // Michigan
      MN: 0.22,    // Minnesota
      MS: 0.18,    // Mississippi
      MO: 0.17,    // Missouri
      MT: 0.2775,  // Montana
      NE: 0.243,   // Nebraska
      NV: 0.23,    // Nevada
      NH: 0.22,    // New Hampshire
      NJ: 0.144,   // New Jersey
      NM: 0.188,   // New Mexico
      NY: 0.392,   // New York
      NC: 0.351,   // North Carolina
      ND: 0.23,    // North Dakota
      OH: 0.28,    // Ohio
      OK: 0.16,    // Oklahoma
      OR: 0.24,    // Oregon
      PA: 0.537,   // Pennsylvania
      RI: 0.32,    // Rhode Island
      SC: 0.167,   // South Carolina
      SD: 0.22,    // South Dakota
      TN: 0.17,    // Tennessee
      TX: 0.20,    // Texas
      UT: 0.294,   // Utah
      VT: 0.263,   // Vermont
      VA: 0.162,   // Virginia
      WA: 0.375,   // Washington
      WV: 0.325,   // West Virginia
      WI: 0.306,   // Wisconsin
      WY: 0.14,    // Wyoming
      // Canadian provinces
      AB: 0.09,    // Alberta
      BC: 0.11,    // British Columbia
      MB: 0.105,   // Manitoba
      NB: 0.152,   // New Brunswick
      NL: 0.165,   // Newfoundland and Labrador
      NT: 0.063,   // Northwest Territories
      NS: 0.154,   // Nova Scotia
      NU: 0.063,   // Nunavut
      ON: 0.147,   // Ontario
      PE: 0.174,   // Prince Edward Island
      QC: 0.202,   // Quebec
      SK: 0.15,    // Saskatchewan
      YT: 0.062,   // Yukon
    };

    // Merge database rates with default rates
    return { ...defaultRates, ...rates };
  } catch (error) {
    console.error('Error fetching jurisdiction rates:', error);
    // Return minimal default rates if database is unavailable
    return {
      CA: 0.387,
      NY: 0.392,
      TX: 0.20,
      FL: 0.205,
      IL: 0.398,
    };
  }
}

/**
 * Get current tax rates for all jurisdictions
 */
export async function getJurisdictionTaxRates(orgId: string): Promise<Record<string, number>> {
  try {
    // TODO: Implement jurisdictionTaxRate model when added to schema
    // const currentDate = new Date();
    // const taxRates = await db.jurisdictionTaxRate.findMany({
    //   where: {
    //     organizationId: orgId,
    //     isActive: true,
    //     effectiveDate: { lte: currentDate },
    //     OR: [
    //       { endDate: null },
    //       { endDate: { gte: currentDate } },
    //     ],
    //   },
    //   orderBy: { effectiveDate: 'desc' },
    // });    const taxRates: any[] = []; // Temporary empty array until model is implemented

    // Convert to jurisdiction -> rate mapping
    const rateMap: Record<string, number> = {};
    // taxRates.forEach((rate: any) => {
    //   if (!rateMap[rate.jurisdiction]) {
    //     rateMap[rate.jurisdiction] = Number(rate.taxRate);
    //   }
    // });

    // Add default rates for common jurisdictions if not present
    const defaultRates = {
      'AL': 0.19, 'AK': 0.08, 'AZ': 0.18, 'AR': 0.225, 'CA': 0.40,
      'CO': 0.205, 'CT': 0.40, 'DE': 0.22, 'FL': 0.06, 'GA': 0.074,
      'HI': 0.17, 'ID': 0.25, 'IL': 0.216, 'IN': 0.16, 'IA': 0.31,
      'KS': 0.26, 'KY': 0.024, 'LA': 0.16, 'ME': 0.301, 'MD': 0.243,
      'MA': 0.21, 'MI': 0.15, 'MN': 0.20, 'MS': 0.177, 'MO': 0.17,
      'MT': 0.2775, 'NE': 0.246, 'NV': 0.27, 'NH': 0.223, 'NJ': 0.105,
      'NM': 0.17, 'NY': 0.08, 'NC': 0.06, 'ND': 0.23, 'OH': 0.28,
      'OK': 0.16, 'OR': 0.01, 'PA': 0.074, 'RI': 0.32, 'SC': 0.16,
      'SD': 0.22, 'TN': 0.17, 'TX': 0.20, 'UT': 0.295, 'VT': 0.26,
      'VA': 0.162, 'WA': 0.375, 'WV': 0.205, 'WI': 0.309, 'WY': 0.24,
    };

    Object.entries(defaultRates).forEach(([jurisdiction, rate]) => {
      if (!rateMap[jurisdiction]) {
        rateMap[jurisdiction] = rate;
      }
    });

    return rateMap;
  } catch (error) {
    console.error('Error getting jurisdiction tax rates:', error);
    return {};
  }
}

/**
 * Update jurisdiction tax rate
 */
export async function updateJurisdictionTaxRate(
  orgId: string,
  jurisdiction: string,
  taxRate: number,
  effectiveDate: Date,
  userId: string
) {  try {
    // TODO: Implement jurisdictionTaxRate model when added to schema
    // Deactivate existing rates for this jurisdiction
    // await db.jurisdictionTaxRate.updateMany({
    //   where: {
    //     organizationId: orgId,
    //     jurisdiction,
    //     isActive: true,
    //   },
    //   data: {
    //     isActive: false,
    //     endDate: new Date(effectiveDate.getTime() - 1), // End one day before new rate
    //   },
    // });

    // Create new rate
    // const newRate = await db.jurisdictionTaxRate.create({
    //   data: {
    //     organizationId: orgId,
    //     jurisdiction,
    //     taxRate,
    //     effectiveDate,
    //     source: 'MANUAL',
    //     verifiedDate: new Date(),
    //     isActive: true,
    //     createdBy: userId,
    //     notes: `Tax rate updated manually by user`,
    //   },
    // });

    const newRate = {
      id: Math.random().toString(36),
      organizationId: orgId,
      jurisdiction,
      taxRate,
      effectiveDate,
      source: 'MANUAL',
      verifiedDate: new Date(),
      isActive: true,
      createdBy: userId,
      notes: `Tax rate updated manually by user`,    };

    return newRate;
  } catch (error) {
    console.error('Error updating tax rate:', error);
    throw new Error(`Failed to update tax rate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate quarterly taxes with advanced calculations
 */
export async function calculateQuarterlyTaxes(
  orgId: string,
  quarter: string,
  year: string
) {
  try {
    await checkUserAccess(orgId);
    
    const data = await getIftaDataForPeriod(orgId, quarter, year);
    const rates = await getJurisdictionRates(orgId);

    // Ensure jurisdictionSummary is always an array
    const jurisdictionSummary = Array.isArray(data.jurisdictionSummary)
      ? data.jurisdictionSummary
      : [];

    let totalTaxDue = 0;
    let totalCredits = 0;
    let totalNetTax = 0;

    const jurisdictionCalculations = jurisdictionSummary.map((jurisdiction) => {
      const rate = rates[jurisdiction.jurisdiction as keyof typeof rates] || 0;
      
      // Get miles and fuel data for this jurisdiction
      const jurisdictionMiles = jurisdiction.miles || jurisdiction.totalMiles || 0;
      const jurisdictionFuelGallons = jurisdiction.fuelGallons || 0;
      
      // Calculate fuel consumed based on miles traveled and fleet average MPG
      const fleetAverageMpg = data.summary.averageMpg || 7.5; // Default to 7.5 MPG for commercial vehicles
      const fuelConsumed = jurisdictionMiles > 0 ? jurisdictionMiles / fleetAverageMpg : 0;
      
      // Calculate tax due based on fuel consumed (not purchased)
      const taxDue = fuelConsumed * rate;
      
      // Calculate credits from fuel purchased in jurisdiction
      const credits = jurisdictionFuelGallons * rate;
      
      // Net tax = tax due - credits (can be negative for refund)
      const netTax = taxDue - credits;
      
      // Track totals
      totalTaxDue += taxDue;
      totalCredits += credits;
      totalNetTax += netTax;

      return {
        jurisdiction: jurisdiction.jurisdiction,
        miles: jurisdictionMiles,
        fuelConsumed: Math.round(fuelConsumed * 100) / 100,
        fuelPurchased: jurisdictionFuelGallons,
        taxRate: rate,
        taxDue: Math.round(taxDue * 100) / 100,
        credits: Math.round(credits * 100) / 100,
        netTax: Math.round(netTax * 100) / 100,
        // Additional calculation details
        averageMpg: fleetAverageMpg,
        fuelEfficiency: jurisdictionMiles > 0 ? Math.round((jurisdictionMiles / fuelConsumed) * 100) / 100 : 0,
      };
    });

    // Calculate summary statistics
    const summary = {
      totalMiles: data.summary.totalMiles,
      totalFuelConsumed: jurisdictionCalculations.reduce((sum, j) => sum + j.fuelConsumed, 0),
      totalFuelPurchased: data.summary.totalGallons,
      totalTaxDue: Math.round(totalTaxDue * 100) / 100,
      totalCredits: Math.round(totalCredits * 100) / 100,
      totalNetTax: Math.round(totalNetTax * 100) / 100,
      averageMpg: data.summary.averageMpg,
      fuelBalance: Math.round((data.summary.totalGallons - jurisdictionCalculations.reduce((sum, j) => sum + j.fuelConsumed, 0)) * 100) / 100,
    };

    return {
      period: data.period,
      summary,
      jurisdictions: jurisdictionCalculations,
      calculatedAt: new Date(),
      calculationMethod: 'ADVANCED_MPG_BASED',
    };
  } catch (error) {
    console.error('Error calculating quarterly taxes:', error);
    throw new Error('Failed to calculate quarterly taxes');
  }
}

/**
 * Validate tax calculations against IFTA regulations
 */
export async function validateTaxCalculations(
  orgId: string,
  quarter: string,
  year: string
) {
  try {
    await checkUserAccess(orgId);
    
    const calculated = await calculateQuarterlyTaxes(orgId, quarter, year);
    const data = await getIftaDataForPeriod(orgId, quarter, year);
    
    // Get existing report if available
    const report = await db.iftaReport.findFirst({
      where: {
        organizationId: orgId,
        quarter: parseInt(quarter.replace('Q', '')),
        year: parseInt(year),
      },
    });

    // Validation checks
    const validationResults = {
      mileageConsistency: validateMileageConsistency(calculated, data),
      fuelBalanceCheck: validateFuelBalance(calculated, data),
      taxRateValidity: validateTaxRates(calculated),
      mpgReasonableness: validateMpgReasonableness(calculated),
      jurisdictionCompleteness: validateJurisdictionCompleteness(calculated, data),
    };

    const isValid = Object.values(validationResults).every(result => result.isValid);

    return {
      calculated,
      report,
      validationResults,
      isValid,
      recommendedActions: generateRecommendedActions(validationResults),
    };
  } catch (error) {
    console.error('Error validating tax calculations:', error);
    throw new Error('Failed to validate tax calculations');
  }
}

/**
 * Helper validation functions
 */
function validateMileageConsistency(calculated: any, data: any) {
  const totalCalculatedMiles = calculated.jurisdictions.reduce((sum: number, j: any) => sum + j.miles, 0);
  const totalReportedMiles = data.summary.totalMiles;
  const difference = Math.abs(totalCalculatedMiles - totalReportedMiles);
  const threshold = totalReportedMiles * 0.05; // 5% tolerance
  
  return {
    isValid: difference <= threshold,
    message: difference > threshold 
      ? `Mileage discrepancy detected: ${difference.toFixed(1)} miles difference`
      : 'Mileage totals are consistent',
    details: {
      calculated: totalCalculatedMiles,
      reported: totalReportedMiles,
      difference,
      threshold,
    },
  };
}

function validateFuelBalance(calculated: any, data: any) {
  const fuelBalance = calculated.summary.fuelBalance;
  const tolerance = data.summary.totalGallons * 0.1; // 10% tolerance
  
  return {
    isValid: Math.abs(fuelBalance) <= tolerance,
    message: Math.abs(fuelBalance) > tolerance
      ? `Significant fuel imbalance: ${fuelBalance.toFixed(1)} gallons`
      : 'Fuel balance is within acceptable range',
    details: {
      balance: fuelBalance,
      tolerance,
      consumed: calculated.summary.totalFuelConsumed,
      purchased: calculated.summary.totalFuelPurchased,
    },
  };
}

function validateTaxRates(calculated: any) {
  const invalidRates = calculated.jurisdictions.filter((j: any) => j.taxRate <= 0 || j.taxRate > 1);
  
  return {
    isValid: invalidRates.length === 0,
    message: invalidRates.length > 0
      ? `Invalid tax rates found for ${invalidRates.map((j: any) => j.jurisdiction).join(', ')}`
      : 'All tax rates are valid',
    details: {
      invalidJurisdictions: invalidRates.map((j: any) => j.jurisdiction),
      totalJurisdictions: calculated.jurisdictions.length,
    },
  };
}

function validateMpgReasonableness(calculated: any) {
  const averageMpg = calculated.summary.averageMpg;
  const minReasonableMpg = 4;  // Minimum reasonable MPG for commercial vehicles
  const maxReasonableMpg = 12; // Maximum reasonable MPG for commercial vehicles
  
  return {
    isValid: averageMpg >= minReasonableMpg && averageMpg <= maxReasonableMpg,
    message: (averageMpg < minReasonableMpg || averageMpg > maxReasonableMpg)
      ? `MPG outside reasonable range: ${averageMpg.toFixed(2)} MPG`
      : 'MPG is within reasonable range',
    details: {
      averageMpg,
      minReasonable: minReasonableMpg,
      maxReasonable: maxReasonableMpg,
    },
  };
}

function validateJurisdictionCompleteness(calculated: any, data: any) {
  const jurisdictionsWithMiles = calculated.jurisdictions.filter((j: any) => j.miles > 0);
  const jurisdictionsWithFuel = calculated.jurisdictions.filter((j: any) => j.fuelPurchased > 0);
  
  return {
    isValid: jurisdictionsWithMiles.length > 0,
    message: jurisdictionsWithMiles.length === 0
      ? 'No jurisdictions with recorded miles found'
      : `${jurisdictionsWithMiles.length} jurisdictions with miles, ${jurisdictionsWithFuel.length} with fuel purchases`,
    details: {
      totalJurisdictions: calculated.jurisdictions.length,
      jurisdictionsWithMiles: jurisdictionsWithMiles.length,
      jurisdictionsWithFuel: jurisdictionsWithFuel.length,
    },
  };
}

function generateRecommendedActions(validationResults: any) {
  const actions = [];
  
  if (!validationResults.mileageConsistency.isValid) {
    actions.push('Review trip records for missing or duplicate entries');
  }
  
  if (!validationResults.fuelBalanceCheck.isValid) {
    actions.push('Verify fuel purchase records and check for missing receipts');
  }
  
  if (!validationResults.taxRateValidity.isValid) {
    actions.push('Update jurisdiction tax rates to current values');
  }
  
  if (!validationResults.mpgReasonableness.isValid) {
    actions.push('Review fuel efficiency calculations and vehicle data');
  }
  
  if (!validationResults.jurisdictionCompleteness.isValid) {
    actions.push('Ensure all interstate travel is properly recorded');
  }
  
  return actions;
}

/**
 * Get tax adjustments and corrections
 */
export async function getTaxAdjustments(orgId: string, year?: number) {
  try {
    await checkUserAccess(orgId);
    
    const where: any = { organizationId: orgId };
    if (year) where.year = year;
    
    const reports = await db.iftaReport.findMany({ 
      where,
      include: {
        submittedByUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { quarter: 'desc' },
      ],
    });
    
    return reports.map(report => ({
      id: report.id,
      quarter: report.quarter,
      year: report.year,
      status: report.status,
      originalCalculation: (report.calculationData as any)?.original || null,
      adjustments: (report.calculationData as any)?.adjustments || [],
      submittedBy: report.submittedByUser,
      submittedAt: report.submittedAt,
      totalTaxDue: report.totalTaxOwed ? Number(report.totalTaxOwed) : 0,
      netAdjustment: ((report.calculationData as any)?.adjustments || [])
        .reduce((sum: number, adj: any) => sum + (adj.amount || 0), 0),
    }));
  } catch (error) {
    console.error('Error fetching tax adjustments:', error);
    throw new Error('Failed to fetch tax adjustments');
  }
}

/**
 * Calculate fuel efficiency metrics
 */
export async function calculateFuelEfficiencyMetrics(
  orgId: string,
  quarter: string,
  year: string
) {
  try {
    await checkUserAccess(orgId);
    
    const data = await getIftaDataForPeriod(orgId, quarter, year);
    const calculated = await calculateQuarterlyTaxes(orgId, quarter, year);
    
    // Calculate efficiency by jurisdiction
    const jurisdictionEfficiency = calculated.jurisdictions.map((j: any) => ({
      jurisdiction: j.jurisdiction,
      miles: j.miles,
      fuelConsumed: j.fuelConsumed,
      fuelPurchased: j.fuelPurchased,
      efficiency: j.fuelEfficiency,
      efficiencyRating: getEfficiencyRating(j.fuelEfficiency),
    }));
    
    // Calculate fleet-wide metrics
    const fleetMetrics = {
      totalMiles: data.summary.totalMiles,
      totalFuelUsed: calculated.summary.totalFuelConsumed,
      averageMpg: calculated.summary.averageMpg,
      fuelCostPerMile: data.summary.totalFuelCost / data.summary.totalMiles,
      efficiencyTrend: 'stable', // Would need historical data for actual trend
      benchmarkComparison: getBenchmarkComparison(calculated.summary.averageMpg),
    };
    
    return {
      period: data.period,
      jurisdictionEfficiency,
      fleetMetrics,
      recommendations: generateEfficiencyRecommendations(fleetMetrics),
    };
  } catch (error) {
    console.error('Error calculating fuel efficiency metrics:', error);
    throw new Error('Failed to calculate fuel efficiency metrics');
  }
}

function getEfficiencyRating(mpg: number): string {
  if (mpg >= 8) return 'Excellent';
  if (mpg >= 7) return 'Good';
  if (mpg >= 6) return 'Average';
  if (mpg >= 5) return 'Below Average';
  return 'Poor';
}

function getBenchmarkComparison(mpg: number): string {
  const industryAverage = 6.8; // Industry average for commercial trucks
  const difference = ((mpg - industryAverage) / industryAverage) * 100;
  
  if (difference > 10) return `${difference.toFixed(1)}% above industry average`;
  if (difference > 0) return `${difference.toFixed(1)}% above industry average`;
  if (difference > -10) return `${Math.abs(difference).toFixed(1)}% below industry average`;
  return `${Math.abs(difference).toFixed(1)}% below industry average`;
}

function generateEfficiencyRecommendations(metrics: any): string[] {
  const recommendations = [];
  
  if (metrics.averageMpg < 6) {
    recommendations.push('Consider driver training programs to improve fuel efficiency');
    recommendations.push('Review vehicle maintenance schedules');
    recommendations.push('Implement route optimization strategies');
  }
  
  if (metrics.fuelCostPerMile > 0.5) {
    recommendations.push('Evaluate fuel purchasing strategies and vendor agreements');
    recommendations.push('Consider fuel card programs for better pricing');
  }
  
  if (metrics.averageMpg > 8) {
    recommendations.push('Excellent efficiency - consider sharing best practices across fleet');
  }
  
  return recommendations;
}

/**
 * Calculate quarterly taxes for IFTA reporting
 */
export async function getIftaFuelData(
  orgId: string,
  startDate: Date,
  endDate: Date,
  vehicleId?: string
) {
  try {
    const fuelPurchases = await db.iftaFuelPurchase.findMany({
      where: {
        organizationId: orgId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(vehicleId && { vehicleId }),
      },
      include: {
        vehicle: {
          select: {
            id: true,
            unitNumber: true,
            make: true,
            model: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return fuelPurchases;
  } catch (error) {
    console.error('Error fetching IFTA fuel data:', error);
    throw new Error('Failed to fetch IFTA fuel data');
  }
}


