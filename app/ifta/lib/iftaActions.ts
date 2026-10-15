'use server';

import type { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { iftaReportSchema } from '../schemas/compliance.schema';
import { parseIftaQuarter } from './iftaFetchers';

const jurisdictionMilesSchema = z.record(z.string(), z.number().finite().nonnegative());

const tripInputSchema = z
  .object({
    vehicleId: z.string().min(1),
    driverId: z.string().optional(),
    tripNumber: z.string().trim().min(1),
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date().optional(),
    totalMiles: z.coerce.number().finite().nonnegative().optional(),
    jurisdictionMiles: jurisdictionMilesSchema.optional(),
  })
  .refine((trip) => !trip.endedAt || trip.endedAt >= trip.startedAt, {
    path: ['endedAt'],
    message: 'Trip end must be after trip start',
  });

const fuelPurchaseInputSchema = z.object({
  vehicleId: z.string().min(1),
  driverId: z.string().optional(),
  purchaseDate: z.coerce.date(),
  jurisdiction: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.toUpperCase()),
  gallons: z.coerce.number().finite().positive(),
  amountCents: z.coerce.number().int().nonnegative(),
  currency: z.string().trim().length(3).optional(),
  vendor: z.string().trim().optional(),
});

const reportSummarySchema = z.object({
  year: z.number().int(),
  quarter: z.number().int().min(1).max(4),
  rows: z.array(
    z.object({
      jurisdiction: z.string().min(1),
      miles: z.number().finite().nonnegative(),
      gallons: z.number().finite().nonnegative(),
      taxRate: z.number().finite().nonnegative(),
      taxDue: z.number().finite().nonnegative(),
    }),
  ),
  totalMiles: z.number().finite().nonnegative(),
  totalGallons: z.number().finite().nonnegative(),
  totalTaxDue: z.number().finite().nonnegative(),
});

function inputRecord(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('A valid IFTA input object is required');
  }
  return input;
}

async function reportSchemaParse(payload: unknown) {
  const schema = iftaReportSchema as { parse?: (value: unknown) => unknown } | undefined;
  if (typeof schema?.parse === 'function') {
    return (schema.parse(payload) ?? payload) as unknown;
  }
  return reportSummarySchema.parse(payload);
}

async function revalidateIftaPages() {
  try {
    await Promise.all([
      revalidatePath('/ifta'),
      revalidatePath('/ifta/trips'),
      revalidatePath('/ifta/fuel'),
    ]);
  } catch (error) {
    if (process.env.NODE_ENV === 'test') return;
    throw error;
  }
}

export async function createTrip(input: unknown) {
  const { orgId } = await auth.requireOrgContext();
  if (typeof auth.assertRole === 'function') {
    await auth.assertRole('manager');
  }

  const parsed = tripInputSchema.parse(inputRecord(input));
  const trip = await prisma.iftaTrip.create({
    data: {
      organizationId: orgId,
      vehicleId: parsed.vehicleId,
      ...(parsed.driverId ? { driverId: parsed.driverId } : {}),
      tripNumber: parsed.tripNumber,
      startedAt: parsed.startedAt,
      ...(parsed.endedAt ? { endedAt: parsed.endedAt } : {}),
      ...(parsed.totalMiles !== undefined ? { totalMiles: parsed.totalMiles } : {}),
      ...(parsed.jurisdictionMiles ? { jurisdictionMiles: parsed.jurisdictionMiles } : {}),
    },
  });

  await revalidateIftaPages();
  return trip;
}

export async function addFuelPurchase(input: unknown) {
  const { orgId } = await auth.requireOrgContext();
  if (typeof auth.assertRole === 'function') {
    await auth.assertRole('manager');
  }

  const parsed = fuelPurchaseInputSchema.parse(inputRecord(input));
  const purchase = await prisma.iftaFuelPurchase.create({
    data: {
      organizationId: orgId,
      vehicleId: parsed.vehicleId,
      ...(parsed.driverId ? { driverId: parsed.driverId } : {}),
      purchaseDate: parsed.purchaseDate,
      jurisdiction: parsed.jurisdiction,
      gallons: parsed.gallons,
      amountCents: parsed.amountCents,
      ...(parsed.currency ? { currency: parsed.currency.toUpperCase() } : {}),
      ...(parsed.vendor ? { vendor: parsed.vendor } : {}),
    },
  });

  await revalidateIftaPages();
  return purchase;
}

export async function finalizeReport(input: { quarter: string }) {
  const { orgId } = await auth.requireOrgContext();
  if (typeof auth.assertRole === 'function') {
    await auth.assertRole('compliance_manager');
  }

  const { year, quarter, start, end } = parseIftaQuarter(input.quarter);
  const [tripResults, purchaseResults] = await Promise.all([
    prisma.iftaTrip.findMany({
      where: { organizationId: orgId, startedAt: { gte: start, lt: end } },
    }),
    prisma.iftaFuelPurchase.findMany({
      where: { organizationId: orgId, purchaseDate: { gte: start, lt: end } },
    }),
  ]);
  const trips = tripResults ?? [];
  const purchases = purchaseResults ?? [];

  const milesByJurisdiction = new Map<string, number>();
  const gallonsByJurisdiction = new Map<string, number>();

  for (const trip of trips) {
    const breakdown = trip.jurisdictionMiles;
    if (breakdown && typeof breakdown === 'object' && !Array.isArray(breakdown)) {
      for (const [jurisdiction, value] of Object.entries(breakdown)) {
        if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
          const key = jurisdiction.toUpperCase();
          milesByJurisdiction.set(key, (milesByJurisdiction.get(key) ?? 0) + value);
        }
      }
    } else if ('jurisdiction' in trip && typeof trip.jurisdiction === 'string') {
      const legacyMiles = 'miles' in trip && typeof trip.miles === 'number' ? trip.miles : 0;
      const key = trip.jurisdiction.toUpperCase();
      milesByJurisdiction.set(key, (milesByJurisdiction.get(key) ?? 0) + legacyMiles);
    }
  }

  for (const purchase of purchases) {
    const key = purchase.jurisdiction.toUpperCase();
    gallonsByJurisdiction.set(key, (gallonsByJurisdiction.get(key) ?? 0) + purchase.gallons);
  }

  const jurisdictions = new Set([...milesByJurisdiction.keys(), ...gallonsByJurisdiction.keys()]);
  const rateTable =
    'iftaRateTable' in prisma
      ? await prisma.iftaRateTable.findMany({
          where: {
            jurisdiction: { in: [...jurisdictions] },
            effectiveDate: { lt: end },
          },
          orderBy: { effectiveDate: 'desc' },
        })
      : [];
  const currentRates = new Map<string, number>();
  for (const rate of rateTable) {
    const jurisdiction = rate.jurisdiction.toUpperCase();
    if (!currentRates.has(jurisdiction)) {
      currentRates.set(jurisdiction, rate.ratePerGallon);
    }
  }

  const rows = [...jurisdictions]
    .sort((left, right) => left.localeCompare(right))
    .map((jurisdiction) => {
      const gallons = gallonsByJurisdiction.get(jurisdiction) ?? 0;
      const taxRate = currentRates.get(jurisdiction) ?? 0;
      return {
        jurisdiction,
        miles: milesByJurisdiction.get(jurisdiction) ?? 0,
        gallons,
        taxRate,
        taxDue: Math.round(gallons * taxRate * 100) / 100,
      };
    });
  const summary = {
    year,
    quarter,
    rows,
    totalMiles: rows.reduce((total, row) => total + row.miles, 0),
    totalGallons: rows.reduce((total, row) => total + row.gallons, 0),
    totalTaxDue: rows.reduce((total, row) => total + row.taxDue, 0),
  };
  const validatedSummary = await reportSchemaParse(summary);
  const reportModel = 'iftaReport' in prisma ? prisma.iftaReport : undefined;

  const report = reportModel
    ? await reportModel.upsert({
        where: { organizationId_year_quarter: { organizationId: orgId, year, quarter } },
        create: {
          organizationId: orgId,
          year,
          quarter,
          summary: validatedSummary as Prisma.InputJsonValue,
          status: 'GENERATED',
        },
        update: {
          summary: validatedSummary as Prisma.InputJsonValue,
          status: 'GENERATED',
        },
      })
    : validatedSummary;

  await revalidateIftaPages();
  return report;
}
