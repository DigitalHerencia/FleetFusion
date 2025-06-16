'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';

import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils/utils';
import { useUserContext } from '@/components/auth/context';
import { SystemRole, SystemRoles } from '@/types/abac';
import { getNavLinks } from '@/components/shared/navigation/nav-links';

interface SidebarNavProps {
  orgId: string;
  userId: string;
}

export function SidebarNav({ orgId, userId }: SidebarNavProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(!isMobile);
  const { signOut } = useClerk();
  const user = useUserContext();
  const role: SystemRole = user?.role || SystemRoles.MEMBER;

  const links = getNavLinks();
  const visible = links.filter(l => !l.roles || l.roles.includes(role));

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300',
        open ? 'translate-x-0 w-64' : '-translate-x-full w-64',
        'md:translate-x-0'
      )}
    >
      <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Main">
        {visible.map(link => {
          const href = link.href(orgId, userId);
          if (link.signOut) {
            return (
              <button
                key={link.key}
                onClick={() => signOut({ redirectUrl: '/' })}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </button>
            );
          }
          return (
            <Link
              key={link.key}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        onClick={() => setOpen(!open)}
        className="absolute top-2 right-2 rounded-full p-1 hover:bg-sidebar-accent md:hidden"
      >
        {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </aside>
  );
}
