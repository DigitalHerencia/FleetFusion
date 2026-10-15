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

export const applicationCapabilities = {
  dispatch: true,
  compliance: true,
  billing: true,
  analytics: true,
} as const;

export const applicationDesign = {
  navigation: "sidebar",
} as const;
