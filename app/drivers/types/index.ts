import type { Driver, DriverShift, Load } from '@prisma/client';

export type DriverProfile = Driver & {
  shifts?: DriverShift[];
  loads?: Load[];
};
export type DriverFilterValues = {
  status?: Driver['status'];
  search?: string;
  page?: number;
  pageSize?: number;
};
export type DriverLocationPayload = {
  lat: number;
  lng: number;
  capturedAt?: Date;
};
