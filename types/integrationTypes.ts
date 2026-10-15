export interface ClerkUserProjection {
  clerkUserId: string;
  email: string | null;
  displayName: string | null;
  imageUrl: string | null;
  username: string | null;
}

export interface IntegrationStatus {
  name: string;
  purpose: string;
  state: "CONFIGURED" | "MISSING SECRET";
  mode: "LIVE" | "DEMO MODE";
}
