'use client';

import type { Load } from '@prisma/client';

import { DispatchCard } from './DispatchCard';

export function DispatchCardOptimistic({ load }: { load: Load }) {
  return <DispatchCard load={load} />;
}

export default DispatchCardOptimistic;
