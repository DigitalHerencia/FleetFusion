import type { LoadStatus } from '@prisma/client';

const transitions: Record<LoadStatus, readonly LoadStatus[]> = {
  DRAFT: ['PLANNED', 'CANCELED'],
  PLANNED: ['ASSIGNED', 'CANCELED'],
  ASSIGNED: ['AT_PICKUP', 'CANCELED'],
  AT_PICKUP: ['IN_TRANSIT', 'CANCELED'],
  IN_TRANSIT: ['AT_DROPOFF', 'CANCELED'],
  AT_DROPOFF: ['DELIVERED', 'CANCELED'],
  DELIVERED: [],
  CANCELED: [],
};

export function inferNextStatusTransition(current: LoadStatus, next: LoadStatus): boolean {
  return transitions[current]?.includes(next) ?? false;
}

export function resolveLoadStatus(load: {
  status: LoadStatus;
  driverId?: string | null;
  pickupScheduledAt?: Date | null;
  dropoffScheduledAt?: Date | null;
}): LoadStatus {
  if (load.status === 'DRAFT' && load.pickupScheduledAt && load.dropoffScheduledAt) {
    return 'PLANNED';
  }
  if (load.status === 'PLANNED' && load.driverId) return 'ASSIGNED';
  return load.status;
}

export function resolveDriverAvailability(driver: {
  status: string;
  shifts?: Array<{ endedAt: Date | null }>;
}): 'AVAILABLE' | 'ON_SHIFT' | 'UNAVAILABLE' {
  if (driver.status !== 'ACTIVE') return 'UNAVAILABLE';
  if (driver.shifts?.some((shift) => shift.endedAt === null)) return 'ON_SHIFT';
  return 'AVAILABLE';
}

export function computeDispatchPriority(
  load: {
    status: LoadStatus;
    pickupScheduledAt?: Date | null;
    dropoffScheduledAt?: Date | null;
  },
  now = new Date(),
): number {
  if (load.status === 'CANCELED' || load.status === 'DELIVERED') return 0;
  let priority = load.status === 'IN_TRANSIT' || load.status === 'AT_DROPOFF' ? 20 : 10;
  const pickup = load.pickupScheduledAt?.getTime();
  if (pickup !== undefined) {
    const hoursUntilPickup = (pickup - now.getTime()) / 3_600_000;
    if (hoursUntilPickup < 0) priority += 50;
    else if (hoursUntilPickup <= 2) priority += 30;
    else if (hoursUntilPickup <= 24) priority += 15;
  }
  return priority;
}
