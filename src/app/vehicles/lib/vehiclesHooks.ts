'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  type VehicleFilters,
  type VehicleInput,
  vehicleFiltersSchema,
  vehicleSchema,
} from '../schemas/vehicles.schema';

export function useVehicleForm(defaultValues?: Partial<VehicleInput>) {
  return useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    mode: 'onBlur',
    defaultValues: {
      status: 'ACTIVE',
      type: 'TRACTOR',
      ...defaultValues,
    },
  });
}

export function useVehicleFilters(initial?: Partial<VehicleFilters>) {
  return useMemo(() => vehicleFiltersSchema.parse(initial ?? {}), [initial]);
}
