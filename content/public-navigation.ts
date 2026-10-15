export const publicNavigation = {
  headerLabel: "Account navigation",
  footerLabel: "Information and policies",
  copyright: "All rights reserved.",
  headerLinks: [
    { label: "Sign in", href: "/sign-in" },
    { label: "Get started", href: "/sign-up?return_to=/dashboard" },
  ],
  footerLinks: [
    { label: "FAQ", href: "/faq" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
} as const;
