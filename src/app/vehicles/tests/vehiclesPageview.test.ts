import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';

import VehiclesPage from '../page';
import {
  ensureDatabase,
  resetVehiclesData,
  seedOrgAndUser,
  seedVehicle,
  setTestAuthContext,
} from './helpers';

describe('vehicles pageview (RSC)', () => {
  beforeAll(async () => {
    ensureDatabase();
    await resetVehiclesData();
    await seedOrgAndUser();
  });

  beforeEach(async () => {
    setTestAuthContext('manager');
    await prisma.vehicle.deleteMany();
  });

  afterAll(async () => {
    await resetVehiclesData();
    await prisma.$disconnect();
  });

  it('renders header and vehicle list from fetcher', async () => {
    await seedVehicle({ vin: 'VIN-RSC-1', name: 'RSC-1', make: 'Make', model: 'Model' });

    const Page = await VehiclesPage;
    render(await Page());

    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('RSC-1')).toBeInTheDocument();
    expect(screen.getByText(/Total:/i)).toBeInTheDocument();
  });
});
