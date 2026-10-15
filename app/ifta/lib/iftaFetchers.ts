import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

export interface IftaQuarter {
  year: number;
  quarter: number;
  start: Date;
  end: Date;
}

export interface IftaJurisdictionRow {
  jurisdiction: string;
  miles: number;
  gallons: number;
  taxRate: number;
  taxDue: number;
}

export function parseIftaQuarter(value: string): IftaQuarter {
  const match = /^(\d{4})-Q([1-4])$/.exec(value);
  if (!match) {
    throw new Error('Quarter must use the format YYYY-Q1 through YYYY-Q4');
  }

  const year = Number(match[1]);
  const quarter = Number(match[2]);
  const start = new Date(Date.UTC(year, (quarter - 1) * 3, 1));
  const end = new Date(Date.UTC(year, quarter * 3, 1));
  return { year, quarter, start, end };
}

export function formatIftaQuarter(year: number, quarter: number) {
  return `${year}-Q${quarter}`;
}

function resolveQuarter(input?: string | { quarter?: string }) {
  if (typeof input === 'string') return parseIftaQuarter(input);
  if (input?.quarter) return parseIftaQuarter(input.quarter);

  const now = new Date();
  const quarter = Math.floor(now.getUTCMonth() / 3) + 1;
  return parseIftaQuarter(formatIftaQuarter(now.getUTCFullYear(), quarter));
}

function readJurisdictionMiles(value: Prisma.JsonValue | null): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([jurisdiction, miles]) =>
      typeof miles === 'number' && Number.isFinite(miles) && miles >= 0
        ? [[jurisdiction.toUpperCase(), miles]]
        : [],
    ),
  );
}

export async function listTrips() {
  const { orgId } = await auth.requireOrgContext();
  return prisma.iftaTrip.findMany({
    where: { organizationId: orgId },
    orderBy: { startedAt: 'desc' },
  });
}

export async function getTripById(input: string | { id: string }) {
  const { orgId } = await auth.requireOrgContext();
  const id = typeof input === 'string' ? input : input.id;
  return prisma.iftaTrip.findFirst({
    where: { id, organizationId: orgId },
  });
}

export async function listFuelPurchases() {
  const { orgId } = await auth.requireOrgContext();
  return prisma.iftaFuelPurchase.findMany({
    where: { organizationId: orgId },
    orderBy: { purchaseDate: 'desc' },
  });
}

export async function getIftaReport(input?: string | { quarter?: string }) {
  const { orgId } = await auth.requireOrgContext();
  const { year, quarter } = resolveQuarter(input);
  return prisma.iftaReport.findFirst({
    where: { organizationId: orgId, year, quarter },
  });
}

export async function getTrips(input?: string | { quarter?: string }) {
  const { orgId } = await auth.requireOrgContext();
  const { start, end } = resolveQuarter(input);
  return prisma.iftaTrip.findMany({
    where: {
      organizationId: orgId,
      startedAt: { gte: start, lt: end },
    },
    orderBy: { startedAt: 'desc' },
  });
}

export async function getJurisdictionMatrix(input?: string | { quarter?: string }) {
  const { orgId } = await auth.requireOrgContext();
  const { start, end } = resolveQuarter(input);
  const [trips, purchases] = await Promise.all([
    prisma.iftaTrip.findMany({
      where: { organizationId: orgId, startedAt: { gte: start, lt: end } },
    }),
    prisma.iftaFuelPurchase.findMany({
      where: { organizationId: orgId, purchaseDate: { gte: start, lt: end } },
    }),
  ]);

  const totals = new Map<string, { miles: number; gallons: number }>();
  const getTotals = (jurisdiction: string) => {
    const key = jurisdiction.trim().toUpperCase();
    const existing = totals.get(key) ?? { miles: 0, gallons: 0 };
    totals.set(key, existing);
    return existing;
  };

  for (const trip of trips) {
    const breakdown = readJurisdictionMiles(trip.jurisdictionMiles);
    const entries = Object.entries(breakdown);
    if (entries.length) {
      for (const [jurisdiction, miles] of entries) {
        getTotals(jurisdiction).miles += miles;
      }
    } else if ('jurisdiction' in trip && typeof trip.jurisdiction === 'string') {
      const legacyMiles = 'miles' in trip && typeof trip.miles === 'number' ? trip.miles : 0;
      getTotals(trip.jurisdiction).miles += legacyMiles;
    }
  }

  for (const purchase of purchases) {
    getTotals(purchase.jurisdiction).gallons += purchase.gallons;
  }

  return [...totals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([jurisdiction, totalsForJurisdiction]) => ({
      jurisdiction,
      ...totalsForJurisdiction,
    }));
}

export async function getReportDraft(input?: string | { quarter?: string }) {
  const { year, quarter } = resolveQuarter(input);
  const rows = await getJurisdictionMatrix(input);
  return { year, quarter, rows };
}
