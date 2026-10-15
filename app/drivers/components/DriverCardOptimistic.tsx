'use client';

import type { Driver } from '@prisma/client';

import { DriverCard } from './DriverCard';

export function DriverCardOptimistic({ driver }: { driver: Driver }) {
  return <DriverCard driver={driver} />;
}

export default DriverCardOptimistic;
