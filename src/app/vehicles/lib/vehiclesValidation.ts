import {
  vehicleFiltersSchema,
  vehicleSchema,
  type VehicleFilters,
  type VehicleInput,
} from '../schemas/vehicles.schema';

export function validateVehicleInput(input: unknown): VehicleInput {
  return vehicleSchema.parse(input);
}

export function safeValidateVehicleInput(input: unknown) {
  return vehicleSchema.safeParse(input);
}

export function validateVehicleFilters(input: unknown): VehicleFilters {
  return vehicleFiltersSchema.parse(input ?? {});
}

export function safeValidateVehicleFilters(input: unknown) {
  return vehicleFiltersSchema.safeParse(input ?? {});
}
