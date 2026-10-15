'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import {
  type VehicleFilters,
  vehicleFiltersSchema,
  type VehicleFormInput,
  type VehicleInput,
  vehicleSchema,
} from '../schemas/vehicles.schema';

export function useVehicleForm(defaultValues?: Partial<VehicleFormInput>) {
  return useForm<VehicleFormInput, undefined, VehicleInput>({
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
