import { Home, Truck, Users, ClipboardList, FileText, BarChart2, Settings, Activity, LogOut, type LucideIcon } from 'lucide-react';
import { SystemRoles, type SystemRole } from '@/types/abac';

export interface NavLink {
  key: string;
  href: (orgId: string, userId: string) => string;
  label: string;
  icon: LucideIcon;
  roles?: SystemRole[];
  signOut?: boolean;
}

export function getNavLinks(): NavLink[] {
  return [
    {
      key: 'dashboard',
      href: (orgId, userId) => `/${orgId}/dashboard/${userId}`,
      label: 'Dashboard',
      icon: Home,
      roles: [
        SystemRoles.ADMIN,
        SystemRoles.DISPATCHER,
        SystemRoles.DRIVER,
        SystemRoles.COMPLIANCE,
        SystemRoles.MEMBER,
      ],
    },
    {
      key: 'dispatch',
      href: (orgId, userId) => `/${orgId}/dispatch/${userId}`,
      label: 'Dispatch',
      icon: ClipboardList,
      roles: [SystemRoles.ADMIN, SystemRoles.DISPATCHER],
    },
    {
      key: 'drivers',
      href: (orgId, userId) => `/${orgId}/drivers/${userId}`,
      label: 'Drivers',
      icon: Users,
      roles: [
        SystemRoles.ADMIN,
        SystemRoles.DISPATCHER,
        SystemRoles.DRIVER,
        SystemRoles.COMPLIANCE,
        SystemRoles.MEMBER,
      ],
    },
    {
      key: 'vehicles',
      href: (orgId) => `/${orgId}/vehicles`,
      label: 'Vehicles',
      icon: Truck,
      roles: [
        SystemRoles.ADMIN,
        SystemRoles.DISPATCHER,
        SystemRoles.DRIVER,
        SystemRoles.COMPLIANCE,
        SystemRoles.MEMBER,
      ],
    },
    {
      key: 'compliance',
      href: (orgId, userId) => `/${orgId}/compliance/${userId}`,
      label: 'Compliance',
      icon: FileText,
      roles: [SystemRoles.ADMIN, SystemRoles.COMPLIANCE],
    },
    {
      key: 'ifta',
      href: (orgId) => `/${orgId}/ifta`,
      label: 'IFTA',
      icon: Activity,
      roles: [SystemRoles.ADMIN, SystemRoles.MEMBER],
    },
    {
      key: 'analytics',
      href: (orgId) => `/${orgId}/analytics`,
      label: 'Analytics',
      icon: BarChart2,
      roles: [SystemRoles.ADMIN, SystemRoles.MEMBER],
    },
    {
      key: 'admin',
      href: (orgId) => `/${orgId}/admin`,
      label: 'Admin',
      icon: Settings,
      roles: [SystemRoles.ADMIN],
    },
    {
      key: 'settings',
      href: (orgId) => `/${orgId}/settings`,
      label: 'Settings',
      icon: Settings,
      roles: [SystemRoles.ADMIN],
    },
    {
      key: 'signout',
      href: () => '#',
      label: 'Sign Out',
      icon: LogOut,
      signOut: true,
    },
  ];
}
