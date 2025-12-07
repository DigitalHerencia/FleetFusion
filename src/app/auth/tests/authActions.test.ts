import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../schemas/auth.schema', () => ({
  signUpSchema: { parse: vi.fn() },
  onboardingSchema: { parse: vi.fn() },
}));
vi.mock('../schemas/invites.schema', () => ({
  inviteCreateSchema: { parse: vi.fn() },
  inviteAcceptSchema: { parse: vi.fn() },
}));
vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn(), assertRole: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { create: vi.fn() },
    organizationMembership: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
    inviteToken: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('authActions (TDD)', () => {
  const orgCtx = { orgId: 'org_123', userId: 'user_456', role: 'owner' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('signUpWithProfile: validates payload, creates user + membership atomically, revalidates session data', async () => {
    const actions = (await import('../lib/authActions')) as any;
    const { signUpSchema } = (await import('../schemas/auth.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { revalidatePath } = await import('next/cache');

    const payload = { email: 'a@b.com', name: 'Ada', password: 'Secret123!' };
    const parsed = { ...payload, profile: { firstName: 'Ada', lastName: 'Lovelace' } };
    vi.mocked(signUpSchema.parse).mockReturnValue(parsed);

    prisma.user.create.mockResolvedValue({ id: 'user_new', email: payload.email });
    prisma.organizationMembership.create.mockResolvedValue({
      id: 'mem_1',
      organizationId: orgCtx.orgId,
    });

    await expect(actions.signUpWithProfile(payload)).resolves.toMatchObject({ id: 'user_new' });

    expect(signUpSchema.parse).toHaveBeenCalledWith(payload);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(prisma.organizationMembership.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: orgCtx.orgId }),
    });
    expect(revalidatePath).toHaveBeenCalled();
  });

  it('completeOnboarding: validates step and updates membership state', async () => {
    const actions = (await import('../lib/authActions')) as any;
    const { onboardingSchema } = (await import('../schemas/auth.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    const step = { step: 'company_profile' };
    vi.mocked(onboardingSchema.parse).mockReturnValue(step);
    prisma.organizationMembership.update.mockResolvedValue({
      id: 'mem_1',
      onboardingStatus: 'completed',
    });

    await expect(actions.completeOnboarding(step)).resolves.toMatchObject({
      onboardingStatus: 'completed',
    });

    expect(prisma.organizationMembership.update).toHaveBeenCalledWith({
      where: { organizationId: orgCtx.orgId, userId: orgCtx.userId },
      data: expect.objectContaining({ onboardingStatus: expect.any(String) }),
    });
  });

  it('createInvite: enforces RBAC, validates payload, stores token', async () => {
    const actions = (await import('../lib/authActions')) as any;
    const { inviteCreateSchema } = (await import('../schemas/invites.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const payload = { email: 'c@d.com', role: 'dispatcher' };
    vi.mocked(inviteCreateSchema.parse).mockReturnValue(payload);
    prisma.inviteToken.create.mockResolvedValue({
      id: 'tok_1',
      email: payload.email,
      organizationId: orgCtx.orgId,
    });

    await expect(actions.createInvite(payload)).resolves.toMatchObject({ id: 'tok_1' });

    expect(auth.assertRole).toHaveBeenCalledWith('owner');
    expect(prisma.inviteToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: orgCtx.orgId, email: payload.email }),
    });
  });

  it('acceptInvite: validates token and creates membership for invitee', async () => {
    const actions = (await import('../lib/authActions')) as any;
    const { inviteAcceptSchema } = (await import('../schemas/invites.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    const payload = { token: 'tok_1' };
    vi.mocked(inviteAcceptSchema.parse).mockReturnValue(payload);
    prisma.inviteToken.findUnique.mockResolvedValue({
      id: 'tok_1',
      organizationId: orgCtx.orgId,
      role: 'viewer',
    });
    prisma.organizationMembership.create.mockResolvedValue({
      id: 'mem_new',
      organizationId: orgCtx.orgId,
      userId: 'user_inv',
    });

    await expect(actions.acceptInvite(payload)).resolves.toMatchObject({ id: 'mem_new' });

    expect(prisma.inviteToken.findUnique).toHaveBeenCalledWith({ where: { id: 'tok_1' } });
    expect(prisma.organizationMembership.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: orgCtx.orgId }),
    });
  });

  it('revokeInvite: marks token as revoked and revalidates invites list', async () => {
    const actions = (await import('../lib/authActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { revalidatePath } = await import('next/cache');

    prisma.inviteToken.update.mockResolvedValue({ id: 'tok_1', revokedAt: new Date() });

    await expect(actions.revokeInvite({ id: 'tok_1' })).resolves.toMatchObject({ id: 'tok_1' });

    expect(prisma.inviteToken.update).toHaveBeenCalledWith({
      where: { id: 'tok_1' },
      data: { revokedAt: expect.any(Date) },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/auth/invites');
  });
});
