import { z } from "zod";
import {
  DriverStatus,
  VehicleStatus,
  VehicleType,
} from "@/generated/prisma/enums";

const optionalText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

const email = z
  .union([z.literal(""), z.string().trim().email().max(254)])
  .optional()
  .transform((value) => value || null);

export const driverInputSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: optionalText(50),
  email,
  status: z.enum(DriverStatus).default("ACTIVE"),
  hiredAt: z.coerce.date().nullable().optional(),
});

export const updateDriverSchema = driverInputSchema.extend({
  driverId: z.uuid(),
  expectedVersion: z.number().int().positive(),
});

export const archiveDriverSchema = z.object({
  driverId: z.uuid(),
  expectedVersion: z.number().int().positive(),
});

export const vehicleInputSchema = z.object({
  unitNumber: z.string().trim().min(1).max(40),
  type: z.enum(VehicleType).default("TRACTOR"),
  status: z.enum(VehicleStatus).default("ACTIVE"),
  vin: optionalText(40),
  plate: optionalText(20),
  plateState: z
    .union([z.literal(""), z.string().trim().length(2)])
    .nullable()
    .optional()
    .transform((value) => value ? value.toUpperCase() : null),
  make: optionalText(80),
  model: optionalText(80),
  year: z.number().int().min(1900).max(2200).nullable().optional(),
});

export const updateVehicleSchema = vehicleInputSchema.extend({
  vehicleId: z.uuid(),
  expectedVersion: z.number().int().positive(),
});

export const archiveVehicleSchema = z.object({
  vehicleId: z.uuid(),
  expectedVersion: z.number().int().positive(),
});
