"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const path = href.split("#")[0].split("?")[0];
  const active = path.length > 0 && pathname === path;
  return <Link href={href} aria-current={active ? "page" : undefined} className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline aria-[current=page]:text-primary">{label}</Link>;
}
