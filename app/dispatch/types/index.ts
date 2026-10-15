import type { Driver, Load, LoadStatus, Vehicle } from '@prisma/client';

export type DispatchLoad = Load & { driver?: Driver | null; vehicle?: Vehicle | null };
export type DispatchBoardColumn = { status: LoadStatus; loads: DispatchLoad[] };
export type DispatchBoardData = {
  columns: DispatchBoardColumn[];
  loads: DispatchLoad[];
  drivers: Driver[];
};
export type DispatchFilterValues = {
  status?: LoadStatus;
  search?: string;
  page?: number;
  pageSize?: number;
};
