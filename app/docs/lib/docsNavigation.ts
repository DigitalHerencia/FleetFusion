import { docsSectionSchema } from '@/docs/schemas/docs.schema';
import type { DocsPage, DocsSection, DocsSectionId } from '@/docs/types';

const sectionData: DocsSection[] = [
  {
    id: 'user-docs',
    title: 'User guides',
    description: 'Set up your workspace and handle everyday fleet operations.',
    pages: [
      {
        slug: 'getting-started',
        title: 'Getting started',
        description: 'A first-day guide for signing in and finding your way around.',
        href: '/docs/user-docs/getting-started',
        contentFile: 'user-docs/getting-started.md',
        section: 'user-docs',
      },
      {
        slug: 'onboarding',
        title: 'Organization onboarding',
        description: 'Create an organization, invite your team, and prepare the workspace.',
        href: '/docs/user-docs/onboarding',
        contentFile: 'user-docs/onboarding.md',
        section: 'user-docs',
      },
      {
        slug: 'daily-operations',
        title: 'Daily operations',
        description: 'Coordinate loads, drivers, vehicles, and operational follow-up.',
        href: '/docs/user-docs/daily-operations',
        contentFile: 'user-docs/daily-operations.md',
        section: 'user-docs',
      },
      {
        slug: 'analytics',
        title: 'Analytics and reports',
        description: 'Read operating KPIs and build reports for your organization.',
        href: '/docs/user-docs/analytics',
        contentFile: 'user-docs/analytics.md',
        section: 'user-docs',
      },
      {
        slug: 'compliance',
        title: 'Compliance workflow',
        description: 'Track required documents and resolve upcoming expirations.',
        href: '/docs/user-docs/compliance',
        contentFile: 'user-docs/compliance.md',
        section: 'user-docs',
      },
    ],
  },
  {
    id: 'product-guides',
    title: 'Product guides',
    description: 'Task-focused walkthroughs of FleetFusion features.',
    pages: [
      {
        slug: 'fleet-management',
        title: 'Fleet management',
        description: 'Maintain trucks, trailers, service vehicles, inspections, and upkeep.',
        href: '/docs/product-guides/fleet-management',
        contentFile: 'product-guides/fleet-management.md',
        section: 'product-guides',
      },
      {
        slug: 'driver-management',
        title: 'Driver management',
        description: 'Manage driver records, qualifications, shifts, and documents.',
        href: '/docs/product-guides/driver-management',
        contentFile: 'product-guides/driver-management.md',
        section: 'product-guides',
      },
      {
        slug: 'dispatching',
        title: 'Dispatching',
        description: 'Create loads, assign available resources, and follow status changes.',
        href: '/docs/product-guides/dispatching',
        contentFile: 'product-guides/dispatching.md',
        section: 'product-guides',
      },
      {
        slug: 'ifta-reporting',
        title: 'IFTA reporting',
        description: 'Record trip miles and fuel purchases, then prepare quarterly reports.',
        href: '/docs/product-guides/ifta-reporting',
        contentFile: 'product-guides/ifta-reporting.md',
        section: 'product-guides',
      },
      {
        slug: 'notifications',
        title: 'Notifications',
        description: 'Choose alert channels and keep track of unread operational updates.',
        href: '/docs/product-guides/notifications',
        contentFile: 'product-guides/notifications.md',
        section: 'product-guides',
      },
    ],
  },
  {
    id: 'admin-guides',
    title: 'Admin guides',
    description: 'Organization and account administration for authorized managers.',
    pages: [
      {
        slug: 'org-settings',
        title: 'Organization settings',
        description: 'Maintain organization details, memberships, and plan settings.',
        href: '/docs/admin-guides/org-settings',
        contentFile: 'admin-guides/org-settings.md',
        section: 'admin-guides',
      },
      {
        slug: 'users-and-roles',
        title: 'Users and roles',
        description: 'Invite teammates and assign access that matches their work.',
        href: '/docs/admin-guides/users-and-roles',
        contentFile: 'admin-guides/users-and-roles.md',
        section: 'admin-guides',
      },
      {
        slug: 'billing',
        title: 'Subscriptions and billing',
        description: 'Understand plan limits and manage subscription details.',
        href: '/docs/admin-guides/billing',
        contentFile: 'admin-guides/billing.md',
        section: 'admin-guides',
      },
      {
        slug: 'feature-flags',
        title: 'Feature availability',
        description: 'Understand organization-level feature availability and rollout.',
        href: '/docs/admin-guides/feature-flags',
        contentFile: 'admin-guides/feature-flags.md',
        section: 'admin-guides',
      },
    ],
  },
  {
    id: 'reference',
    title: 'Reference',
    description: 'Technical notes for configuration, security, and operations.',
    pages: [
      {
        slug: 'configuration',
        title: 'Configuration reference',
        description: 'Application configuration concepts and environment boundaries.',
        href: '/docs/reference/configuration',
        contentFile: 'reference/configuration.md',
        section: 'reference',
      },
      {
        slug: 'security',
        title: 'Security and access model',
        description: 'Authentication, authorization, tenant isolation, and safe handling.',
        href: '/docs/reference/security',
        contentFile: 'reference/security.md',
        section: 'reference',
      },
      {
        slug: 'observability',
        title: 'Observability',
        description: 'Signals, dashboards, health checks, and operational alert thresholds.',
        href: '/docs/reference/observability',
        contentFile: 'reference/observability.md',
        section: 'reference',
      },
    ],
  },
];

export const docsSections: DocsSection[] = sectionData.map(
  (section) => docsSectionSchema.parse(section) as DocsSection,
);
export const docsPages: DocsPage[] = docsSections.flatMap((section) => section.pages);

export function getDocsPage(slug: string): DocsPage | undefined {
  if (slug === 'overview') {
    return {
      slug: 'overview',
      title: 'FleetFusion at a glance',
      description: 'How FleetFusion brings fleet operations together.',
      href: '/docs/overview',
      contentFile: 'overview.md',
    };
  }
  return docsPages.find((page) => page.slug === slug);
}

export function getDocsSection(id: DocsSectionId): DocsSection | undefined {
  return docsSections.find((section) => section.id === id);
}
