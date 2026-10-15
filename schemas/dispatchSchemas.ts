import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const loadStatuses = [
  "DRAFT", "BOOKED", "DISPATCHED", "AT_PICKUP",
  "IN_TRANSIT", "AT_DELIVERY", "DELIVERED", "CANCELED",
] as const;

export const loadStopInputSchema = z
  .object({
    type: z.enum(["PICKUP", "DELIVERY"]),
    locationName: optionalText(200),
    address1: optionalText(200),
    city: z.string().trim().min(1).max(120),
    state: z.string().trim().length(2).transform((v) => v.toUpperCase()),
    postalCode: optionalText(12),
    windowStart: z.coerce.date().optional(),
    windowEnd: z.coerce.date().optional(),
  })
  .refine((s) => !s.windowStart || !s.windowEnd || s.windowStart <= s.windowEnd, {
    message: "Window must end after it starts.",
    path: ["windowEnd"],
  });

export const createLoadSchema = z
  .object({
    customerAccountId: z.uuid().optional(),
    referenceNumber: optionalText(80),
    rate: z.coerce.number().min(0).max(1_000_000).default(0),
    miles: z.coerce.number().int().min(0).max(10_000).optional(),
    notes: optionalText(2000),
    stops: z.array(loadStopInputSchema).min(2).max(20),
  })
  .refine((l) => l.stops[0]?.type === "PICKUP", {
    message: "The first stop must be a pickup.",
    path: ["stops"],
  })
  .refine((l) => l.stops.at(-1)?.type === "DELIVERY", {
    message: "The last stop must be a delivery.",
    path: ["stops"],
  });

export const assignLoadSchema = z.object({
  loadId: z.uuid(),
  driverId: z.uuid().nullable(),
  vehicleId: z.uuid().nullable(),
  expectedVersion: z.number().int().positive(),
});

export const advanceLoadStatusSchema = z.object({
  loadId: z.uuid(),
  status: z.enum(loadStatuses),
  expectedVersion: z.number().int().positive(),
});