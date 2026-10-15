export const authHeaderContent = {
  homeHref: "/",
  homeLabel: "Back to home",
} as const;

export const authContent = {
  eyebrow: "On Security",
  title: "We take security very seriously.",
  description:
    "Our policies do not put users' data at risk. Their PII already got leaked...just not by us.",
  formPosition: { signIn: "right", signUp: "left" },
} as const;

export const authAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full border-0 bg-transparent shadow-none",
    card: "w-full border-0 bg-transparent p-0 shadow-none",
    footer: "bg-transparent",
    headerTitle: "text-foreground",
    headerSubtitle: "text-foreground",
    formFieldLabel: "text-foreground",
    footerActionText: "text-foreground",
    footerActionLink: "text-foreground",
  },
} as const;
