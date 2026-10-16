export const applicationProduct = {
  name: "FleetFusion",
  brand: {
    title: "FleetFusion",
    subtitle: "Fleet Operations Platform",
    image: "/favicon.png",
    homeLabel: "FleetFusion home",
  },
  description:
    "Dispatch, compliance, and fleet operations for independent and growing fleets.",
} as const;

/**
 * Product capabilities are deliberately explicit. P0 surfaces are enabled;
 * P1 workflows remain disabled until their complete implementation is shipped.
 */
export const applicationCapabilities = {
  dispatch: true,
  fleet: true,
  compliance: true,
  billing: true,
  customers: true,
  dashboard: true,
  aiRateConfirmationIntake: false,
  iftaReporting: false,
  driverSettlements: false,
  customerTracking: false,
  dragDropDispatch: false,
} as const;

export const applicationDesign = {
  navigation: "sidebar",
} as const;
