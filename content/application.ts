export const applicationProduct = {
  name: "The Maximal Template™ Domain Library",
  brand: {
    title: "The Maximal Template™",
    subtitle: "Domain Library",
    image: "/favicon.png",
    homeLabel: "The Maximal Template™ Domain Library home",
  },
  description: "Productivity is dead. Long live product.",
} as const;

export const applicationCapabilities = {
  marketing: true,
  crm: true,
  projects: true,
  support: true,
  marketingAutomation: true,
  invoicing: true,
  social: true,
  ai: true,
  portal: true,
  admin: true,
} as const;

export const applicationDesign = {
  navigation: "sidebar",
} as const;
