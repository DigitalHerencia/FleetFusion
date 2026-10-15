import type { LoadStatus } from "@/generated/prisma/enums";

export const loadStatusTransitions: Record<LoadStatus, readonly LoadStatus[]> = {
  DRAFT: ["BOOKED", "CANCELED"],
  BOOKED: ["DISPATCHED", "CANCELED"],
  DISPATCHED: ["AT_PICKUP", "BOOKED", "CANCELED"],
  AT_PICKUP: ["IN_TRANSIT", "CANCELED"],
  IN_TRANSIT: ["AT_DELIVERY"],
  AT_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELED: [],
};

export const loadStatusLabels: Record<LoadStatus, string> = {
  DRAFT: "Draft",
  BOOKED: "Booked",
  DISPATCHED: "Dispatched",
  AT_PICKUP: "At pickup",
  IN_TRANSIT: "In transit",
  AT_DELIVERY: "At delivery",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
};

export function canTransitionLoad(from: LoadStatus, to: LoadStatus): boolean {
  return loadStatusTransitions[from].includes(to);
}