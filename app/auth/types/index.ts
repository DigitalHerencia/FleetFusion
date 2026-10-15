import type { MembershipRole } from '../lib/authRBAC';

export type AuthOrganization = {
  id: string;
  name: string;
  slug: string;
  role: MembershipRole;
  membershipId: string;
};

export type AuthUserProfile = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  organizations: AuthOrganization[];
};

export type AuthInvite = {
  id: string;
  email: string;
  role: MembershipRole;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  acceptedAt: string | null;
};

export type OnboardingState = {
  status: 'incomplete' | 'completed';
  step: 'company_profile' | 'team_setup' | 'complete';
  completedAt: string | null;
};
