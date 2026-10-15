import type { appRoles } from "@/lib/authz/roles";
import type { permissions } from "@/lib/authz/permissions";

export type AppRole = (typeof appRoles)[number];

export type Permission = (typeof permissions)[number];

/** Clerk establishes user identity only. Application tenancy is resolved locally. */
export interface AuthenticatedIdentity {
  clerkUserId: string;
}

export interface AuthenticatedSession {
  clerkUserId: string;
  clerkSessionId: string;
}

export interface CurrentSessionContext {
  isAuthenticated: boolean;
  clerkUserId: string | null;
  clerkSessionId: string | null;
}

export interface CurrentUserProfile {
  clerkUserId: string;
  displayName: string | null;
  primaryEmailAddress: string | null;
  imageUrl: string;
}

export interface AccessContext extends AuthenticatedIdentity {
  userId: string;
  organizationId: string;
  membershipId: string;
  role: AppRole;
}

export type ResourceKind =
  | "organization"
  | "crm"
  | "project"
  | "task"
  | "support-ticket"
  | "campaign"
  | "invoice"
  | "social-post"
  | "ai-generation"
  | "portal-document"
  | "audit-event";

export interface ResourceAccessDescriptor {
  kind: ResourceKind;
  organizationId: string;
  ownerMembershipId?: string | null;
  assigneeMembershipId?: string | null;
  requesterUserId?: string | null;
  clientVisible?: boolean;
}
