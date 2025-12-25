import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';

import {
  ensureDatabase,
  resetVehiclesData,
  seedOrgAndUser,
  seedVehicle,
  setTestAuthContext,
} from './helpers';

const PAGEVIEW_TEST_ORG_ID = 'org_vehicles_pageview';
const PAGEVIEW_TEST_USER_ID = 'user_vehicles_pageview';

describe('vehiclesPageview (RSC page rendering)', () => {
  beforeAll(async () => {
    ensureDatabase();
    await resetVehiclesData(PAGEVIEW_TEST_ORG_ID);
    await seedOrgAndUser(PAGEVIEW_TEST_ORG_ID, PAGEVIEW_TEST_USER_ID);
  });

  beforeEach(async () => {
    // Set a manager role context for each test
    await resetVehiclesData(PAGEVIEW_TEST_ORG_ID);
    await seedOrgAndUser(PAGEVIEW_TEST_ORG_ID, PAGEVIEW_TEST_USER_ID);
    setTestAuthContext('manager', PAGEVIEW_TEST_ORG_ID, PAGEVIEW_TEST_USER_ID);
  });

  afterAll(async () => {
    await resetVehiclesData();
    await prisma.$disconnect();
  });

  it('renders the vehicles list page with correct total count and vehicle info', async () => {
    // Dynamically import the RSC page component
    const VehiclesPage = (await import('../page')).default;
    await prisma.vehicle.deleteMany({ where: { organizationId: PAGEVIEW_TEST_ORG_ID } });
    // Seed a couple of vehicles
    await seedVehicle(
      { vin: 'PAGE-VIN-1', name: 'PageTest Truck 1' },
      PAGEVIEW_TEST_ORG_ID,
      PAGEVIEW_TEST_USER_ID,
    );
    await seedVehicle(
      { vin: 'PAGE-VIN-2', name: 'PageTest Truck 2' },
      PAGEVIEW_TEST_ORG_ID,
      PAGEVIEW_TEST_USER_ID,
    );
    // Render the page (as a React element)
    const pageElement = await VehiclesPage();
    // The page should contain a header with the total count of vehicles (2)
    // We'll convert the element to JSON for inspection
    const ReactDomServer = await import('react-dom/server');
    const htmlOutput = ReactDomServer.renderToStaticMarkup(pageElement as React.ReactElement);
    expect(htmlOutput).toContain('Total: 2');
  });

  it('includes loading and error boundaries components', async () => {
    const Loading = (await import('../loading')).default;
    const ErrorComponent = (await import('../error')).default;
    // Loading should render without throwing
    const loadingElement = Loading();
    expect(loadingElement).toBeDefined();
    // Error component should display an error message
    const testError = new Error('Test Error');
    const errorElement = ErrorComponent({ error: testError, reset: () => {} });
    // Convert errorElement to JSON to inspect content
    const ReactDomServer = await import('react-dom/server');
    const errorHtml = ReactDomServer.renderToStaticMarkup(errorElement as React.ReactElement);
    expect(errorHtml).toContain('Test Error');
  });
});
